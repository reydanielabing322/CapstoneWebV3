const { createClient } = require('@supabase/supabase-js');
const { Pool } = require("pg");
let supabase;
let pool;


const initializeDatabase = async () => {
    try {
        supabase = createClient(process.env.supabaseURL, process.env.supabaseKey)
        console.log("Connected to supabase")

        const databaseName = "postgres"
        const port = 5432

        pool = new Pool({
            user: process.env.user,
            host: process.env.host,
            database: databaseName,
            password: process.env.databasePassword,
            port: port,
        });
        const createShortUUID = `
            CREATE OR REPLACE FUNCTION generate_short_uuid()
            RETURNS TEXT AS
            $$
            BEGIN
                RETURN substr(uuid_generate_v4()::text, 1, 8);
            END;
            $$ LANGUAGE plpgsql;

            SELECT generate_short_uuid(); 
        `

        const createGenderType = `
        DO $$ 
        BEGIN 
            IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
                CREATE TYPE gender AS ENUM('male', 'female', 'others');
            END IF;
        END $$;
        `;

        const createRoleType = `
        DO $$ 
        BEGIN 
            IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'role') THEN
                CREATE TYPE role AS ENUM('admin', 'buyer', 'dealershipManager', 'dealershipAgent', 'bankAgent');
            END IF;
        END $$;
        `;

        const createAgentType = `
        DO $$ 
        BEGIN 
            IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'agenttype') THEN
                CREATE TYPE agenttype AS ENUM('dealershipAgent', 'bankAgent');
            END IF;
        END $$;
        `;

        await pool.query(createShortUUID);
        await pool.query(createRoleType);
        await pool.query(createGenderType);
        await pool.query(createAgentType);

        await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        let createUserProfileTable = `CREATE TABLE IF NOT EXISTS tblUserProfile(
            id UUID PRIMARY KEY,
            firstName VARCHAR(50), 
            lastName VARCHAR(50), 
            email VARCHAR NOT NULL,
            phoneNumber VARCHAR(50),
            address VARCHAR(255),
            gender gender,
            role role NOT NULL,
            profileImage VARCHAR NOT NULL,
            isApproved BOOLEAN DEFAULT FALSE NOT NULL,
            CONSTRAINT unique_email UNIQUE(email),
            createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMPTZ
        )`;

        await pool.query(createUserProfileTable);

        const handleOnSignUpQuery = `
            CREATE OR REPLACE FUNCTION public.handle_new_user()
            RETURNS TRIGGER AS $$
            DECLARE
            admin_id UUID;
            BEGIN
                IF new.raw_user_meta_data ->> 'iss' = 'https://accounts.google.com' THEN
                    INSERT INTO public.tbluserprofile (id, email, profileimage, role, isapproved)
                    VALUES (
                        new.id,
                        new.email,
                        new.raw_user_meta_data ->> 'picture',
                        'buyer'::public.role,
                        TRUE
                    );
                    FOR admin_id IN SELECT id FROM public.tbluserprofile WHERE role = 'admin'::public.role
                    LOOP
                        INSERT INTO public.tblNotifications(userid, notification)
                        VALUES (admin_id, 'A Buyer ' || NEW.id || ' has registered their account.');
                    END LOOP;
                ELSE
                    INSERT INTO public.tbluserprofile (id, email, firstname, lastname, phonenumber, address, gender, role, isapproved)
                    VALUES (
                        new.id,
                        new.email,
                        new.raw_user_meta_data ->> 'firstName',
                        new.raw_user_meta_data ->> 'lastName',
                        new.raw_user_meta_data ->> 'phoneNumber',
                        new.raw_user_meta_data ->> 'address',
                        CASE 
                            WHEN new.raw_user_meta_data ->> 'gender' = 'male' THEN 'male'::public.gender
                            WHEN new.raw_user_meta_data ->> 'gender' = 'female' THEN 'female'::public.gender
                            ELSE 'others'::public.gender
                        END,
                        CASE 
                            WHEN new.raw_user_meta_data ->> 'role' = 'admin' THEN 'admin'::public.role
                            WHEN new.raw_user_meta_data ->> 'role' = 'buyer' THEN 'buyer'::public.role
                            WHEN new.raw_user_meta_data ->> 'role' = 'dealershipManager' THEN 'dealershipManager'::public.role
                            WHEN new.raw_user_meta_data ->> 'role' = 'dealershipAgent' THEN 'dealershipAgent'::public.role
                            WHEN new.raw_user_meta_data ->> 'role' = 'bankAgent' THEN 'bankAgent'::public.role
                        END,
                        CASE
                            WHEN new.raw_user_meta_data ->> 'isApproved' = 'true' THEN TRUE
                            WHEN new.raw_user_meta_data ->> 'isApproved' = 'false' THEN FALSE
                        END
                    );
                END IF;
        
                IF new.raw_user_meta_data ->> 'role' = 'buyer' THEN
                    FOR admin_id IN SELECT id FROM public.tbluserprofile WHERE role = 'admin'::public.role
                    LOOP
                        INSERT INTO public.tblNotifications(userid, notification)
                        VALUES (admin_id, 'A Buyer ' || NEW.id || ' has registered their account.');
                    END LOOP;
                END IF;
        
                RETURN new;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        
            drop trigger if exists on_auth_user_created on auth.users;
        
            create trigger on_auth_user_created
              after insert on auth.users
              for each row execute procedure public.handle_new_user();
        
            `;
        await pool.query(handleOnSignUpQuery);

        let createDealershipTable = `CREATE TABLE IF NOT EXISTS tblDealership(
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            manager UUID,
            latitude DECIMAL(9, 6) NOT NULL,
            longitude DECIMAL(9, 6) NOT NULL,
            address VARCHAR(255) NOT NULL,
            image VARCHAR,
            createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMPTZ,

            FOREIGN KEY(manager) REFERENCES tblUserProfile(id) ON DELETE CASCADE
        )`;

        await pool.query(createDealershipTable);

        let createModeOfPaymentTable = `CREATE TABLE IF NOT EXISTS tblModeOfPayment(
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            modeOfPayment VARCHAR NOT NULL UNIQUE,

            createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMPTZ
        )`

        await pool.query(createModeOfPaymentTable);

        let createModeOfPayments = `
            INSERT INTO tblModeOfPayment (modeOfPayment)
            SELECT modeOfPayment
            FROM (
                SELECT 'cash' AS modeOfPayment
                UNION ALL
                SELECT 'inhouseFinance' AS modeOfPayment
                UNION ALL
                SELECT 'bankLoan(dealershipBankChoice)' AS modeOfPayment
                UNION ALL
                SELECT 'bankLoan(buyerBankChoice)' AS modeOfPayment
            ) AS tmp
            WHERE modeOfPayment IS NOT NULL
            AND NOT EXISTS (
                SELECT 1 FROM tblModeOfPayment WHERE modeOfPayment = tmp.modeOfPayment
            );
        `
        await pool.query(createModeOfPayments);

        let createDealershipModeOfPaymentTable = `CREATE TABLE IF NOT EXISTS tblDealershipModeOfPayment(
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            dealership UUID NOT NULL,
            modeOfPayment UUID NOT NULL,

            createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMPTZ,

            FOREIGN KEY (dealership) REFERENCES tblDealership (id) ON DELETE CASCADE,
            FOREIGN KEY (modeOfPayment) REFERENCES tblModeOfPayment (id) ON DELETE CASCADE,
            CONSTRAINT unique_dealership_mode_of_payment UNIQUE (dealership, modeOfPayment)
        )`
        await pool.query(createDealershipModeOfPaymentTable)

        let createAgentTable = `CREATE TABLE IF NOT EXISTS tblAgent(
            id UUID PRIMARY KEY,
            dealership UUID NOT NULL,
            type agentType NOT NULL,
            --isAuthorized BOOL DEFAULT FALSE,

            createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMPTZ,

            FOREIGN KEY(id) REFERENCES tblUserProfile(id) ON DELETE CASCADE,
            FOREIGN KEY(dealership) REFERENCES tblDealership(id) ON DELETE CASCADE
        )`;

        await pool.query(createAgentTable);

        let createBankAgentTable = `CREATE TABLE IF NOT EXISTS tblBankAgent(
            id UUID PRIMARY KEY,
            bank VARCHAR NOT NULL,
            bankAddress VARCHAR NOT NULL,

            createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMPTZ,

            FOREIGN KEY (id) REFERENCES tblAgent (id) ON DELETE CASCADE
        )`;

        await pool.query(createBankAgentTable);


        let createListingTable = `CREATE TABLE IF NOT EXISTS tblListing(
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            modelAndName VARCHAR(255) NOT NULL,
            make VARCHAR(255) NOT NULL,
            fuelType VARCHAR(255) NOT NULL,
            power VARCHAR(255) NOT NULL,
            transmission VARCHAR(255) NOT NULL,
            engine VARCHAR(255) NOT NULL,
            fuelTankCapacity VARCHAR(255) NOT NULL,
            seatingCapacity VARCHAR(255) NOT NULL,
            price NUMERIC NOT NULL,
            vehicleType VARCHAR(255) NOT NULL,
            image VARCHAR(255) NOT NULL,
            dealership UUID NOT NULL,
            isAvailable BOOLEAN NOT NULL DEFAULT TRUE,

            createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMPTZ,
        
            FOREIGN KEY (dealership) REFERENCES tblDealership(id)
        );`

        await pool.query(createListingTable);

        let createNotificationsTable = `CREATE TABLE IF NOT EXISTS tblNotifications(
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            userId UUID,
            notification VARCHAR NOT NULL,
            createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMPTZ,

            FOREIGN KEY (userId) REFERENCES tblUserProfile(id) ON DELETE CASCADE 
        )`;

        await pool.query(createNotificationsTable);

        const createApplicationStatusType = `
        DO $$ 
        BEGIN 
            IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'applicationstatus') THEN
                CREATE TYPE applicationstatus AS ENUM('pending', 'on-going', 'completed', 'rejected');
            END IF;
        END $$;
        `;
        await pool.query(createApplicationStatusType)

        const createCashModeOfPayment = `
        DO $$ 
        BEGIN 
            IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'cashmodeofpayment') THEN
                CREATE TYPE cashmodeofpayment AS ENUM('overthecounter', 'chequeondelivery');
            END IF;
        END $$;
        `;
        await pool.query(createCashModeOfPayment)


        let createBuyerBankLoanApplicationTable = `CREATE TABLE IF NOT EXISTS tblBuyerBankLoanApplication(
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            buyer UUID NOT NULL,
            listing UUID NOT NULL, 
            agent UUID,
            status applicationstatus NOT NULL DEFAULT 'pending',
            progress INT NOT NULL DEFAULT 0,
            
            firstName VARCHAR NOT NULL,
            lastName VARCHAR NOT NULL,
            address VARCHAR NOT NULL,
            phoneNumber VARCHAR NOT NULL,
            validId VARCHAR NOT NULL,
            signature VARCHAR NOT NULL,
            bankcertificate VARCHAR,
            applicationpdf VARCHAR,

            -- 0 pending
            -- 1 application approved by agent, documents on review
            -- 2 documents (firstname, lastname, id, signature) approved by agent
            -- 3 bank certificate approved by agent
            -- 4 ready for release

            createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMPTZ,

            FOREIGN KEY (buyer) REFERENCES tblUserProfile(id) ON DELETE CASCADE,
            FOREIGN KEY (listing) REFERENCES tblListing(id) ON DELETE CASCADE,
            FOREIGN KEY (agent) REFERENCES tblUserProfile(id) ON DELETE CASCADE,
            
            CONSTRAINT progress_range_check CHECK ( progress >= -1 AND progress <= 4),
            CONSTRAINT unique_buyer_bank_application UNIQUE(buyer, listing)
        );`
        await pool.query(createBuyerBankLoanApplicationTable);

        let createCashApplicationTable = `CREATE TABLE IF NOT EXISTS tblCashApplication (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            buyer UUID NOT NULL,
            listing UUID NOT NULL,
            agent UUID,
            status applicationstatus NOT NULL DEFAULT 'pending',
            progress INT NOT NULL DEFAULT 0,
            modeofpayment cashmodeofpayment NOT NULL,

            firstName VARCHAR NOT NULL,
            lastName VARCHAR NOT NULL,
            address VARCHAR NOT NULL,
            phoneNumber VARCHAR NOT NULL, 
            validId VARCHAR NOT NULL,
            signature VARCHAR NOT NULL,
            applicationpdf VARCHAR,

            createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMPTZ,

            FOREIGN KEY (buyer) REFERENCES tblUserProfile (id) ON DELETE CASCADE,
            FOREIGN KEY (listing) REFERENCES tblListing (id) ON DELETE CASCADE,
            FOREIGN KEY (agent) REFERENCES tblUserProfile(id) ON DELETE CASCADE,

            CONSTRAINT progress_range_check CHECK (progress >= -1 AND progress <= 4),
            CONSTRAINT unique_cash_application UNIQUE (listing, buyer)
        )`;

        await pool.query(createCashApplicationTable);

        let createinhouseFinanceApplicationTable = `CREATE TABLE IF NOT EXISTS tblinhouseFinanceApplication(
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            buyer UUID NOT NULL,
            listing UUID NOT NULL,
            agent UUID,
            status applicationstatus NOT NULL DEFAULT 'pending',

            progress INT NOT NULL CHECK (progress >= -1 AND progress <= 7) DEFAULT 0,

            firstName VARCHAR NOT NULL,
            lastName VARCHAR NOT NULL,
            address VARCHAR NOT NULL,
            phoneNumber VARCHAR NOT NULL,
            validId VARCHAR NOT NULL,
            signature VARCHAR NOT NULL,
            applicationpdf VARCHAR,

            coMakerFirstName VARCHAR,
            coMakerLastName VARCHAR,
            coMakerAddress VARCHAR,
            coMakerPhoneNumber VARCHAR,
            coMakerValidId VARCHAR,
            coMakerSignature VARCHAR,

            createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMPTZ,

            FOREIGN KEY (buyer) REFERENCES tblUserProfile (id) ON DELETE CASCADE,
            FOREIGN KEY (listing) REFERENCES tblListing (id) ON DELETE CASCADE,
            FOREIGN KEY (agent) REFERENCES tblUserProfile (id) ON DELETE CASCADE,

            CONSTRAINT unique_installment_application UNIQUE (listing, buyer)
        )`;

        await pool.query(createinhouseFinanceApplicationTable);

        let createDealershipBankLoanApplicationTable = `CREATE TABLE IF NOT EXISTS tblDealershipBankLoanApplication (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            buyer UUID NOT NULL,
            listing UUID NOT NULL,
            agent UUID,
            bankAgent UUID,
            status applicationstatus NOT NULL DEFAULT 'pending',
            progress INT NOT NULL DEFAULT 0,

            firstName VARCHAR NOT NULL,
            lastName VARCHAR NOT NULL,
            address VARCHAR NOT NULL,
            phoneNumber VARCHAR NOT NULL, 
            validId VARCHAR NOT NULL,
            signature VARCHAR NOT NULL,
            loancertificate VARCHAR,
            applicationpdf VARCHAR,

            createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMPTZ,

            FOREIGN KEY (buyer) REFERENCES tblUserProfile (id) ON DELETE CASCADE,
            FOREIGN KEY (listing) REFERENCES tblListing (id) ON DELETE CASCADE,
            FOREIGN KEY (agent) REFERENCES tblUserProfile(id) ON DELETE CASCADE,
            FOREIGN KEY (bankAgent) REFERENCES tblUserProfile(id) ON DELETE CASCADE,

            CONSTRAINT progress_range_check CHECK (progress >= -1 AND progress <= 7),
            CONSTRAINT unique_dealership_bank_application UNIQUE (listing, buyer)
        )`;

        await pool.query(createDealershipBankLoanApplicationTable);

        // let createVehicleTable = `CREATE TABLE IF NOT EXISTS tblVehicle(
        //     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        //     userId UUID NOT NULL,
        //     modelAndName VARCHAR(255) NOT NULL,
        //     make VARCHAR(255) NOT NULL,
        //     fuelType VARCHAR(255) NOT NULL,
        //     power VARCHAR(255) NOT NULL,
        //     transmission VARCHAR(255) NOT NULL,
        //     engine VARCHAR(255) NOT NULL,
        //     fuelTankCapacity VARCHAR(255) NOT NULL,
        //     seatingCapacity VARCHAR(255) NOT NULL,
        //     price INT NOT NULL,
        //     vehicleType VARCHAR(255) NOT NULL,
        //     image VARCHAR(255) NOT NULL, 
        //     isRegistered BOOLEAN DEFAULT FALSE NOT NULL,

        //     registeredOn TIMESTAMPTZ,
        //     registrationExpiry TIMESTAMPTZ,

        //     createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        //     updatedAt TIMESTAMPTZ,

        //     FOREIGN KEY (userId) REFERENCES tblUserProfile(id) ON DELETE CASCADE
        // )`;

        // await pool.query(createVehicleTable);

        // let createRegistrationRequestTable = `CREATE TABLE IF NOT EXISTS tblRegistrationRequest(
        //     id UUID PRIMARY KEY,
        //     vehicleId UUID NOT NULL,
        //     listingId UUID NOT NULL,
        //     dealership UUID NOT NULL,
        //     dealershipAgent UUID NOT NULL,
        //     progress INT NOT NULL CHECK (progress >= 1 AND progress <= 3) DEFAULT 1,

        //     createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        //     updatedAt TIMESTAMPTZ,

        //     FOREIGN KEY (vehicleId) REFERENCES tblVehicle(id) ON DELETE CASCADE,
        //     FOREIGN KEY (listingId) REFERENCES tblListing (id) ON DELETE CASCADE,
        //     FOREIGN KEY (dealership) REFERENCES tblDealership (id) ON DELETE CASCADE,
        //     FOREIGN KEY (dealershipAgent) REFERENCES tblUserProfile (id)
        // )`;

        // await pool.query(createRegistrationRequestTable);


        let createOTPTable = `CREATE TABLE IF NOT EXISTS tblOTP(
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            userId UUID NOT NULL,
            code INT NOT NULL,

            createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            expiredAt TIMESTAMPTZ NOT NULL,
            isUsed BOOLEAN DEFAULT FALSE,

            FOREIGN KEY (userId) REFERENCES tblUserProfile (id) ON DELETE CASCADE
        )`;


        await pool.query(createOTPTable);

        console.log("Connected to postgres database")
    } catch (e) {
        console.log("Failed to connect to supabase", e);
    }
}

initializeDatabase();

module.exports = {
    supabase,
    pool
}