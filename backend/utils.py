from typing import Any, Dict, Optional

def fix_schema_for_openai(schema: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fix JSON schema to meet OpenAI's function calling requirements:
    1. All object schemas must have additionalProperties: false
    2. The 'required' array must include ALL properties (even optional ones)
    """
    if isinstance(schema, dict):
        # Make a copy to avoid modifying the original
        fixed_schema = schema.copy()
        
        # If this is an object schema, ensure additionalProperties is false
        if fixed_schema.get("type") == "object":
            fixed_schema["additionalProperties"] = False
            
            # OpenAI requires ALL properties to be in the required array
            if "properties" in fixed_schema:
                properties_keys = list(fixed_schema["properties"].keys())
                fixed_schema["required"] = properties_keys
        
        # Recursively fix nested schemas
        for key, value in fixed_schema.items():
            if key == "properties" and isinstance(value, dict):
                fixed_schema[key] = {k: fix_schema_for_openai(v) for k, v in value.items()}
            elif key == "items" and isinstance(value, dict):
                fixed_schema[key] = fix_schema_for_openai(value)
            elif key == "anyOf" and isinstance(value, list):
                fixed_schema[key] = [fix_schema_for_openai(item) for item in value]
            elif key == "allOf" and isinstance(value, list):
                fixed_schema[key] = [fix_schema_for_openai(item) for item in value]
            elif key == "oneOf" and isinstance(value, list):
                fixed_schema[key] = [fix_schema_for_openai(item) for item in value]
            elif isinstance(value, dict):
                fixed_schema[key] = fix_schema_for_openai(value)
                
        return fixed_schema
    else:
        return schema