-- GET TABLES
SELECT * FROM pg_catalog.pg_tables WHERE table_schema = ANY (current_schemas(false))

-- GET COLUMNS
SELECT * FROM information_schema."columns"

-- GET VIEWS
SELECT table_name FROM INFORMATION_SCHEMA.views WHERE table_schema = ANY (current_schemas(false))


-- GET FOREIGN KEYS
SELECT
  tc.table_schema,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM  information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'

-- GET PRIMARY KEYS
SELECT kcu.table_schema,
  kcu.table_name,
  tco.constraint_name,
  kcu.column_name AS column_name
FROM information_schema.table_constraints tco
JOIN information_schema.key_column_usage kcu
  ON kcu.constraint_name = tco.constraint_name
  AND kcu.constraint_schema = tco.constraint_schema
  AND kcu.constraint_name = tco.constraint_name
WHERE tco.constraint_type = 'PRIMARY KEY'


-- GET CUSTOM TYPE
SELECT n.nspname AS schema,
        pg_catalog.format_type ( t.oid, NULL ) AS name,
        t.typname AS internal_name,
        CASE
            WHEN t.typrelid != 0
            THEN CAST ( 'tuple' AS pg_catalog.text )
            WHEN t.typlen < 0
            THEN CAST ( 'var' AS pg_catalog.text )
            ELSE CAST ( t.typlen AS pg_catalog.text )
        END AS size,
        pg_catalog.array_to_string (
            ARRAY( SELECT e.enumlabel
                    FROM pg_catalog.pg_enum e
                    WHERE e.enumtypid = t.oid
                    ORDER BY e.oid ), E', '
            ) AS elements,
        pg_catalog.obj_description ( t.oid, 'pg_type' ) AS description
    FROM pg_catalog.pg_type t
    LEFT JOIN pg_catalog.pg_namespace n
        ON n.oid = t.typnamespace
    WHERE ( t.typrelid = 0
            OR ( SELECT c.relkind = 'c'
                    FROM pg_catalog.pg_class c
                    WHERE c.oid = t.typrelid
                )
        )
        AND NOT EXISTS
            ( SELECT 1
                FROM pg_catalog.pg_type el
                WHERE el.oid = t.typelem
                    AND el.typarray = t.oid
            )
        AND n.nspname <> 'pg_catalog'
        AND n.nspname <> 'information_schema'
        AND pg_catalog.pg_type_is_visible ( t.oid )
    ORDER BY 1, 2;