# Tables

### <a name="migrations"></a>migrations

| Name | Type | Nullable | References |
| -- | -- | -- | -- |
| id <span style="background: #ddd; padding: 2px; font-size: 0.75rem">PK</span> | integer | False | 
name | character varying | False | 
run_on | timestamp without time zone | False |  |

### <a name="user_account"></a>user_account

| Name | Type | Nullable | References |
| -- | -- | -- | -- |
| id <span style="background: #ddd; padding: 2px; font-size: 0.75rem">PK</span> | uuid | False | 
email | text | False | 
password | text | False | 
role | user defined | False | 
is_verified | boolean | False |  |

### <a name="verification_token"></a>verification_token

| Name | Type | Nullable | References |
| -- | -- | -- | -- |
| id <span style="background: #ddd; padding: 2px; font-size: 0.75rem">PK</span> | uuid | False | 
user_id | uuid | False | [user_account.id](#user_account)
token | text | False | 
created_at | timestamp with time zone | False |  |

### <a name="feature"></a>feature

| Name | Type | Nullable | References |
| -- | -- | -- | -- |
| id <span style="background: #ddd; padding: 2px; font-size: 0.75rem">PK</span> | uuid | False | 
user_id | uuid | False | [user_account.id](#user_account)
name | text | False | 
key | text | False |  |

### <a name="flag"></a>flag

| Name | Type | Nullable | References |
| -- | -- | -- | -- |
| id <span style="background: #ddd; padding: 2px; font-size: 0.75rem">PK</span> | uuid | False | 
feature_id | uuid | False | [feature.id](#feature)
name | text | False | 
enabled | boolean | False | 
predicates | jsonb | False |  |

# Views

