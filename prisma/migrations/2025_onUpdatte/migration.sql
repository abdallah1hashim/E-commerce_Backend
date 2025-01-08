CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_update_trigger_to_table(target_table regclass) 
RETURNS void AS $$
BEGIN
    -- Check if the table has updated_at column
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = target_table::text 
        AND column_name = 'updated_at'
    ) THEN
        -- Create or replace the UPDATE trigger
        EXECUTE format('
            CREATE OR REPLACE TRIGGER set_timestamp_update
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at()
        ', target_table::text);

        -- Create or replace the INSERT trigger
        EXECUTE format('
            CREATE OR REPLACE TRIGGER set_timestamp_insert
            BEFORE INSERT ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at()
        ', target_table::text);
    ELSE
        RAISE NOTICE 'Table % does not have updated_at column', target_table;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for "user" table
CREATE TRIGGER set_updated_at_user_update
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_user_insert
BEFORE INSERT ON "user"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

SELECT add_update_trigger_to_table('product');
SELECT add_update_trigger_to_table('product_images');
SELECT add_update_trigger_to_table('product_details');