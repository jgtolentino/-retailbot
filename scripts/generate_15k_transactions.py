#!/usr/bin/env python3
"""
Generate 15,000 synthetic retail transactions in JSON format
Based on the Scout Databank schema
"""

import json
import random
import datetime
from datetime import timedelta
import uuid

# Sample data based on the CSV files shown
BRANDS = [
    "Nike", "Adidas", "Samsung", "Apple", "Sony", "LG", "Panasonic", 
    "Unilever", "P&G", "Nestle", "Coca-Cola", "PepsiCo", "Microsoft",
    "Dell", "HP", "Lenovo", "Asus", "Canon", "Nikon", "Under Armour"
]

PRODUCT_CATEGORIES = [
    "Electronics", "Apparel", "Food & Beverage", "Home & Garden", 
    "Sports & Outdoors", "Beauty & Personal Care", "Toys & Games",
    "Office Supplies", "Automotive", "Health & Wellness"
]

STORE_LOCATIONS = [
    {"city": "Manila", "region": "NCR", "country": "Philippines"},
    {"city": "Quezon City", "region": "NCR", "country": "Philippines"},
    {"city": "Cebu City", "region": "Central Visayas", "country": "Philippines"},
    {"city": "Davao City", "region": "Davao Region", "country": "Philippines"},
    {"city": "Singapore", "region": "Singapore", "country": "Singapore"},
    {"city": "Bangkok", "region": "Bangkok", "country": "Thailand"},
    {"city": "Jakarta", "region": "Jakarta", "country": "Indonesia"},
    {"city": "Kuala Lumpur", "region": "Kuala Lumpur", "country": "Malaysia"},
    {"city": "Ho Chi Minh City", "region": "Southeast", "country": "Vietnam"},
    {"city": "Tokyo", "region": "Kanto", "country": "Japan"}
]

STORE_NAMES = [
    "MegaMart", "CityMall", "Express Store", "SuperShop", "QuickBuy",
    "ValueMart", "PrimeStore", "MetroMall", "Central Plaza", "Town Square"
]

# Customer names
FIRST_NAMES = ["Juan", "Maria", "Jose", "Ana", "Pedro", "Rosa", "Carlos", "Elena", 
               "Miguel", "Sofia", "David", "Laura", "James", "Emma", "John", "Olivia"]
LAST_NAMES = ["Cruz", "Santos", "Reyes", "Garcia", "Lopez", "Martinez", "Rodriguez",
              "Hernandez", "Gonzalez", "Perez", "Tan", "Lim", "Wong", "Chen", "Smith"]

def generate_sku(category, brand):
    """Generate a realistic SKU"""
    cat_code = category[:3].upper()
    brand_code = brand[:3].upper()
    number = random.randint(1000, 9999)
    return f"{cat_code}-{brand_code}-{number}"

def generate_transactions(num_records=15000):
    """Generate synthetic transaction data"""
    transactions = []
    
    # Generate some recurring customers
    customers = []
    for _ in range(1000):  # 1000 unique customers
        customer = {
            "id": str(uuid.uuid4()),
            "name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            "email": f"{random.choice(FIRST_NAMES).lower()}.{random.choice(LAST_NAMES).lower()}@email.com",
            "phone": f"+63{random.randint(9000000000, 9999999999)}"
        }
        customers.append(customer)
    
    # Generate products
    products = []
    for category in PRODUCT_CATEGORIES:
        for _ in range(50):  # 50 products per category
            brand = random.choice(BRANDS)
            product = {
                "id": str(uuid.uuid4()),
                "name": f"{brand} {category} Item {random.randint(100, 999)}",
                "category": category,
                "subcategory": f"{category} - Type {random.randint(1, 5)}",
                "brand": brand,
                "sku": generate_sku(category, brand),
                "unit_price": round(random.uniform(10, 5000), 2)
            }
            products.append(product)
    
    # Generate stores
    stores = []
    for store_name in STORE_NAMES:
        for location in random.sample(STORE_LOCATIONS, 3):  # Each store in 3 locations
            store = {
                "id": str(uuid.uuid4()),
                "name": f"{store_name} {location['city']}",
                "location": location['city'],
                "region": location['region'],
                "country": location['country']
            }
            stores.append(store)
    
    # Generate transactions
    start_date = datetime.datetime(2024, 1, 1)
    end_date = datetime.datetime(2024, 12, 31)
    
    for i in range(num_records):
        # Random date within 2024
        order_date = start_date + timedelta(
            seconds=random.randint(0, int((end_date - start_date).total_seconds()))
        )
        ship_date = order_date + timedelta(days=random.randint(1, 7))
        
        customer = random.choice(customers)
        product = random.choice(products)
        store = random.choice(stores)
        
        quantity = random.randint(1, 10)
        discount = round(random.choice([0, 0.05, 0.1, 0.15, 0.2, 0.25]), 2)
        
        sales = round(product['unit_price'] * quantity * (1 - discount), 2)
        # Profit margin between 10% and 40%
        profit_margin = random.uniform(0.1, 0.4)
        profit = round(sales * profit_margin, 2)
        
        transaction = {
            "transaction_id": str(uuid.uuid4()),
            "order_id": f"ORD-{order_date.strftime('%Y%m%d')}-{i:06d}",
            "order_date": order_date.strftime("%Y-%m-%d"),
            "ship_date": ship_date.strftime("%Y-%m-%d"),
            "ship_mode": random.choice(["Standard", "Express", "Priority", "Same Day"]),
            "customer_id": customer['id'],
            "customer_name": customer['name'],
            "customer_email": customer['email'],
            "customer_phone": customer['phone'],
            "store_id": store['id'],
            "store_name": store['name'],
            "store_location": store['location'],
            "region": store['region'],
            "country": store['country'],
            "product_id": product['id'],
            "product_name": product['name'],
            "product_category": product['category'],
            "product_subcategory": product['subcategory'],
            "brand": product['brand'],
            "sku": product['sku'],
            "unit_price": product['unit_price'],
            "quantity": quantity,
            "discount": discount,
            "sales": sales,
            "profit": profit,
            "created_at": datetime.datetime.now().isoformat(),
            "updated_at": datetime.datetime.now().isoformat()
        }
        
        transactions.append(transaction)
        
        if (i + 1) % 1000 == 0:
            print(f"Generated {i + 1} transactions...")
    
    return transactions

def save_to_json(transactions, filename="synthetic_transactions_15k.json"):
    """Save transactions to JSON file"""
    with open(filename, 'w') as f:
        json.dump(transactions, f, indent=2)
    print(f"\nSaved {len(transactions)} transactions to {filename}")

def save_to_jsonl(transactions, filename="synthetic_transactions_15k.jsonl"):
    """Save transactions to JSONL file (one JSON object per line)"""
    with open(filename, 'w') as f:
        for transaction in transactions:
            f.write(json.dumps(transaction) + '\n')
    print(f"Saved {len(transactions)} transactions to {filename}")

if __name__ == "__main__":
    print("Generating 15,000 synthetic retail transactions...")
    transactions = generate_transactions(15000)
    
    # Save as both JSON and JSONL formats
    save_to_json(transactions)
    save_to_jsonl(transactions)
    
    # Show sample transaction
    print("\nSample transaction:")
    print(json.dumps(transactions[0], indent=2))
    
    # Generate summary statistics
    total_sales = sum(t['sales'] for t in transactions)
    total_profit = sum(t['profit'] for t in transactions)
    avg_order_value = total_sales / len(transactions)
    
    print(f"\nSummary Statistics:")
    print(f"Total Transactions: {len(transactions):,}")
    print(f"Total Sales: ${total_sales:,.2f}")
    print(f"Total Profit: ${total_profit:,.2f}")
    print(f"Average Order Value: ${avg_order_value:.2f}")
    print(f"Profit Margin: {(total_profit/total_sales)*100:.1f}%")