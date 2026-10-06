import sys

def calculate(a, b):
    """
    Calculates the sum and product of two numbers.
    Returns a dictionary with 'sum', 'product', 'success', and optional 'error'.
    """
    try:
        num_a = float(a)
        num_b = float(b)
        
        sum_val = num_a + num_b
        prod_val = num_a * num_b
        
        if sum_val.is_integer():
            sum_val = int(sum_val)
        if prod_val.is_integer():
            prod_val = int(prod_val)
            
        return {
            "sum": sum_val,
            "product": prod_val,
            "success": True,
            "error": None
        }
    except Exception as e:
        return {
            "sum": None,
            "product": None,
            "success": False,
            "error": str(e)
        }

def get_info():
    """
    Returns system information about the Python environment.
    """
    return f"Python {sys.version.split()[0]} (Pyodide WebAssembly)"
