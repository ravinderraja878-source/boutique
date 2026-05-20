from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
import os
from models import User, Product, Order, OrderItem, Video
from extensions import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt

api_bp = Blueprint('api', __name__)

@api_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 400

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        # In a real app, check is_verified too
        access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})
        return jsonify(access_token=access_token, role=user.role), 200
        
    return jsonify({"error": "Invalid credentials"}), 401

@api_bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products]), 200

@api_bp.route('/admin/products', methods=['POST'])
@jwt_required()
def upload_product():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"error": "Admin privileges required"}), 403

    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
        
    image = request.files['image']
    if image.filename == '':
        return jsonify({"error": "Empty filename"}), 400
        
    name = request.form.get('name')
    category = request.form.get('category')
    price = request.form.get('price')
    sizes = request.form.get('sizes')
    description = request.form.get('description')
    
    if not all([name, category, price, sizes]):
        return jsonify({"error": "Missing required fields"}), 400
        
    filename = secure_filename(image.filename)
    upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
    image.save(upload_path)
    
    new_product = Product(
        name=name,
        category=category,
        price=float(price),
        sizes=sizes,
        description=description,
        image_url=f"/uploads/{filename}"
    )
    
    db.session.add(new_product)
    db.session.commit()
    
    return jsonify({"message": "Product uploaded successfully", "product_id": new_product.id}), 201

@api_bp.route('/admin/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"error": "Admin privileges required"}), 403
        
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
        
    if product.image_url:
        filename = os.path.basename(product.image_url)
        image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(image_path):
            os.remove(image_path)
            
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({"message": "Product deleted successfully"}), 200

@api_bp.route('/uploads/<filename>')
def serve_image(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@api_bp.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    user_id = get_jwt_identity()
    
    data = request.get_json()
    items = data.get('items', [])
    total_amount = data.get('total_amount', 0)
    address = data.get('address')
    pincode = data.get('pincode')
    phone = data.get('phone')
    payment_method = data.get('payment_method')

    if not items:
        return jsonify({"error": "No items in order"}), 400

    new_order = Order(
        user_id=user_id, 
        total_amount=total_amount,
        address=address,
        pincode=pincode,
        phone=phone,
        payment_method=payment_method
    )
    db.session.add(new_order)
    db.session.commit() # Commit to get order ID

    for item in items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.get('product_id'),
            quantity=item.get('quantity'),
            price=item.get('price'),
            size=item.get('size')
        )
        db.session.add(order_item)
    
    db.session.commit()

    return jsonify({"message": "Order placed successfully", "order_id": new_order.id}), 201

@api_bp.route('/user/orders', methods=['GET'])
@jwt_required()
def get_user_orders():
    user_id = get_jwt_identity()

    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return jsonify([order.to_dict() for order in orders]), 200

@api_bp.route('/admin/orders', methods=['GET'])
@jwt_required()
def get_admin_orders():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"error": "Admin privileges required"}), 403

    orders = Order.query.order_by(Order.created_at.desc()).all()
    
    # Optional: fetch user emails and attach them, but we only have user_id in the order
    # For a simple approach, we'll just return the order. User info is attached by manually querying if needed, or by joining.
    result = []
    for order in orders:
        order_dict = order.to_dict()
        user = User.query.get(order.user_id)
        order_dict['user_email'] = user.email if user else 'Unknown'
        result.append(order_dict)

    return jsonify(result), 200

@api_bp.route('/admin/orders/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"error": "Admin privileges required"}), 403

    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    # Delete associated order items first to prevent constraint failures
    OrderItem.query.filter_by(order_id=order_id).delete()
    
    db.session.delete(order)
    db.session.commit()

    return jsonify({"message": "Order deleted successfully"}), 200

@api_bp.route('/videos', methods=['GET'])
def get_videos():
    videos = Video.query.order_by(Video.created_at.desc()).all()
    return jsonify([video.to_dict() for video in videos]), 200

@api_bp.route('/admin/videos', methods=['POST'])
@jwt_required()
def upload_video():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"error": "Admin privileges required"}), 403

    if 'video' not in request.files:
        return jsonify({"error": "No video provided"}), 400
        
    video_file = request.files['video']
    if video_file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
        
    title = request.form.get('title')
    
    if not title:
        return jsonify({"error": "Missing video title"}), 400
        
    filename = secure_filename(video_file.filename)
    upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
    video_file.save(upload_path)
    
    new_video = Video(
        title=title,
        video_url=f"/uploads/{filename}"
    )
    
    db.session.add(new_video)
    db.session.commit()
    
    return jsonify({"message": "Video uploaded successfully", "video_id": new_video.id}), 201

@api_bp.route('/admin/videos/<int:video_id>', methods=['DELETE'])
@jwt_required()
def delete_video(video_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"error": "Admin privileges required"}), 403
        
    video = Video.query.get(video_id)
    if not video:
        return jsonify({"error": "Video not found"}), 404
        
    if video.video_url:
        filename = os.path.basename(video.video_url)
        video_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(video_path):
            os.remove(video_path)
            
    db.session.delete(video)
    db.session.commit()
    
    return jsonify({"message": "Video deleted successfully"}), 200
