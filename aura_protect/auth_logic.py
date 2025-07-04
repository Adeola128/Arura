import uuid

MOCK_USERS_DB = []  # List to store User objects

class User:
    def __init__(self, fullname, email, password_hash, account_type):
        self.id = str(uuid.uuid4()) # Generate a unique ID for the user
        self.fullname = fullname
        self.email = email
        self.password_hash = password_hash
        self.account_type = account_type # 'creator' or 'buyer'
        self.is_active = True # Could be used for deactivation later
        self.is_authenticated = False # Will be set to True on successful login

    def __repr__(self):
        return f"<User {self.id} - {self.email} ({self.account_type})>"

    def get_id(self):
        return self.id

# --- Mock Hashing ---
# In a real application, use a strong hashing library like bcrypt or passlib
def mock_hash_password(password):
    """Simulates password hashing. DO NOT USE IN PRODUCTION."""
    if not password:
        return None
    return f"{password}_hashed"

def mock_verify_password(hashed_password, plain_password):
    """Simulates password verification. DO NOT USE IN PRODUCTION."""
    if not hashed_password or not plain_password:
        return False
    return hashed_password == mock_hash_password(plain_password)

# --- User Management Functions ---

def find_user_by_email(email):
    """Finds a user by their email in the mock database."""
    for user in MOCK_USERS_DB:
        if user.email == email:
            return user
    return None

def register_user(fullname, email, password, account_type):
    """
    Registers a new user.
    Returns a dictionary with 'success' (boolean) and 'message' (string).
    """
    if not all([fullname, email, password, account_type]):
        return {"success": False, "message": "All fields are required."}

    if find_user_by_email(email):
        return {"success": False, "message": "Email already registered."}

    hashed_password = mock_hash_password(password)
    if not hashed_password:
        return {"success": False, "message": "Password hashing failed."} # Should not happen with mock

    new_user = User(
        fullname=fullname,
        email=email,
        password_hash=hashed_password,
        account_type=account_type
    )
    MOCK_USERS_DB.append(new_user)
    print(f"User registered: {new_user.email}, DB now: {MOCK_USERS_DB}") # For server-side logging/debug
    return {"success": True, "message": "Registration successful! You can now login."}


# --- Example Usage (for testing purposes, will be removed or commented out later) ---
if __name__ == '__main__':
    # This part is just for demonstration and won't run when imported
    print("Auth Logic Initialized.")

    # Test registration
    reg_result1 = register_user("Alice Wonderland", "alice@example.com", "alicepass", "creator")
    print(reg_result1)
    reg_result2 = register_user("Bob The Builder", "bob@example.com", "bobpass", "buyer")
    print(reg_result2)
    reg_result3 = register_user("Alice Wonderland", "alice@example.com", "anotherpass", "creator") # Duplicate email
    print(reg_result3)
    reg_result4 = register_user("", "", "", "") # Empty fields
    print(reg_result4)

    print(f"Mock DB state after registration tests: {MOCK_USERS_DB}")


def login_user(email, password):
    """
    Logs in an existing user.
    Returns a dictionary with 'success' (boolean), 'message' (string), and 'user' (User object or None).
    """
    if not email or not password:
        return {"success": False, "message": "Email and password are required.", "user": None}

    user = find_user_by_email(email)
    if not user:
        return {"success": False, "message": "Invalid email or password.", "user": None}

    if not mock_verify_password(user.password_hash, password):
        return {"success": False, "message": "Invalid email or password.", "user": None}

    user.is_authenticated = True # Set authentication status
    print(f"User logged in: {user.email}") # For server-side logging/debug
    return {"success": True, "message": "Login successful!", "user": user}


if __name__ == '__main__':
    # This part is just for demonstration and won't run when imported
    print("Auth Logic Initialized.")

    # Test registration
    reg_result1 = register_user("Alice Wonderland", "alice@example.com", "alicepass", "creator")
    print(f"Reg1: {reg_result1}")
    reg_result2 = register_user("Bob The Builder", "bob@example.com", "bobpass", "buyer")
    print(f"Reg2: {reg_result2}")

    print(f"\nMock DB state before login tests: {MOCK_USERS_DB}")

    # Test login
    login_res1 = login_user("alice@example.com", "alicepass")
    print(f"Login1: {login_res1}")
    if login_res1["user"]:
        print(f"Alice's auth status: {login_res1['user'].is_authenticated}")


    login_res2 = login_user("bob@example.com", "wrongpass")
    print(f"Login2: {login_res2}")

    login_res3 = login_user("unknown@example.com", "anypass")
    print(f"Login3: {login_res3}")

    login_res4 = login_user("bob@example.com", "bobpass")
    print(f"Login4: {login_res4}")
    if login_res4["user"]:
        print(f"Bob's auth status: {login_res4['user'].is_authenticated}")

    # Verify user object properties
    if login_res1['success']:
        print(f"Logged in user details: ID={login_res1['user'].id}, Name={login_res1['user'].fullname}")

def logout_user(user_obj):
    """
    Logs out a user by setting their is_authenticated status to False.
    In a real web app, this would also involve clearing session data.
    Returns a dictionary with 'success' (boolean) and 'message' (string).
    """
    if user_obj and isinstance(user_obj, User):
        user_obj.is_authenticated = False
        print(f"User logged out: {user_obj.email}") # For server-side logging/debug
        return {"success": True, "message": "Logout successful."}
    return {"success": False, "message": "No user to logout or invalid user object."}


if __name__ == '__main__':
    # This part is just for demonstration and won't run when imported
    print("Auth Logic Initialized.")

    # Test registration
    reg_result1 = register_user("Alice Wonderland", "alice@example.com", "alicepass", "creator")
    # print(f"Reg1: {reg_result1}") # Keep console cleaner for this test
    reg_result2 = register_user("Bob The Builder", "bob@example.com", "bobpass", "buyer")
    # print(f"Reg2: {reg_result2}")

    # print(f"\nMock DB state before login tests: {MOCK_USERS_DB}")

    # Test login
    login_res_alice = login_user("alice@example.com", "alicepass")
    print(f"Login Alice: {login_res_alice}")

    if login_res_alice["user"]:
        print(f"Alice's auth status before logout: {login_res_alice['user'].is_authenticated}")
        logout_res_alice = logout_user(login_res_alice["user"])
        print(f"Logout Alice: {logout_res_alice}")
        print(f"Alice's auth status after logout: {login_res_alice['user'].is_authenticated}")

    login_res_bob_fail = login_user("bob@example.com", "wrongpass")
    # print(f"Login Bob Fail: {login_res_bob_fail}")

    login_res_unknown = login_user("unknown@example.com", "anypass")
    # print(f"Login Unknown: {login_res_unknown}")

    login_res_bob_ok = login_user("bob@example.com", "bobpass")
    # print(f"Login Bob OK: {login_res_bob_ok}")
    if login_res_bob_ok["user"]:
        # print(f"Bob's auth status: {login_res_bob_ok['user'].is_authenticated}")
        pass # Bob remains logged in for now

    # Test logout with no user
    logout_no_user = logout_user(None)
    print(f"Logout None: {logout_no_user}")
