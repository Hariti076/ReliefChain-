module ReliefChain::ReliefChain {
    use aptos_framework::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_framework::table::{Self, Table};

    /// Struct representing the disaster relief fund pool
    struct ReliefFund has store, key {
        total_donations: u64,              // Total donations received
        total_distributed: u64,            // Total funds distributed to recipients
        active_disasters: u64,             // Number of active disaster zones
        min_distribution: u64,             // Minimum amount per recipient
        admin_address: address,            // Address of the authorized admin
        fund_signer_cap: account::SignerCapability,  // Capability to sign for fund account
        recipients: Table<address, RecipientRecord>,  // Fast lookup table for recipients
        verified_count: u64,               // Count of verified recipients
    }

    /// Individual recipient record with verification status
    struct RecipientRecord has store, drop {
        is_verified: bool,         // Verification status (must be true to receive funds)
        amount_received: u64,      // Total amount received by recipient
        last_distribution: u64,    // Timestamp of last distribution
        verification_date: u64,    // When recipient was verified
        verification_notes: vector<u8>, // Optional verification details/disaster ID
    }

    /// Initialize the relief fund with a dedicated resource account
    public fun initialize_relief_fund(admin: &signer, min_distribution: u64, seed: vector<u8>) {
        let admin_address = signer::address_of(admin);
        
        // Create resource account for the fund
        let (fund_signer, fund_signer_cap) = account::create_resource_account(admin, seed);
        
        // Register the fund account for AptosCoin
        coin::register<AptosCoin>(&fund_signer);
        
        let relief_fund = ReliefFund {
            total_donations: 0,
            total_distributed: 0,
            active_disasters: 0,
            min_distribution,
            admin_address,
            fund_signer_cap,
            recipients: table::new(),
            verified_count: 0,
        };
        
        move_to(admin, relief_fund);
    }

    /// Function for donors to contribute to the disaster relief fund
    public fun donate_to_relief(
        donor: &signer, 
        admin_address: address, 
        amount: u64
    ) acquires ReliefFund {
        let relief_fund = borrow_global_mut<ReliefFund>(admin_address);
        let fund_address = account::get_signer_capability_address(&relief_fund.fund_signer_cap);
        
        // Transfer donation from donor to the dedicated fund account
        let donation = coin::withdraw<AptosCoin>(donor, amount);
        coin::deposit<AptosCoin>(fund_address, donation);
        
        // Update total donations
        relief_fund.total_donations = relief_fund.total_donations + amount;
    }

    /// Admin function to verify recipients before they can receive funds
    public fun verify_recipient(
        admin: &signer,
        recipient_address: address,
        verification_notes: vector<u8>
    ) acquires ReliefFund {
        let admin_address = signer::address_of(admin);
        let relief_fund = borrow_global_mut<ReliefFund>(admin_address);
        
        // Verify admin authorization
        assert!(admin_address == relief_fund.admin_address, 3);
        
        let current_time = timestamp::now_seconds();
        
        if (table::contains(&relief_fund.recipients, recipient_address)) {
            // Update existing recipient verification
            let record = table::borrow_mut(&mut relief_fund.recipients, recipient_address);
            if (!record.is_verified) {
                record.is_verified = true;
                record.verification_date = current_time;
                record.verification_notes = verification_notes;
                relief_fund.verified_count = relief_fund.verified_count + 1;
            };
        } else {
            // Create new verified recipient record
            let new_record = RecipientRecord {
                is_verified: true,
                amount_received: 0,
                last_distribution: 0,
                verification_date: current_time,
                verification_notes,
            };
            table::add(&mut relief_fund.recipients, recipient_address, new_record);
            relief_fund.verified_count = relief_fund.verified_count + 1;
        };
    }

    /// Function to distribute relief funds to verified recipients only
    public fun distribute_relief(
        admin: &signer,
        recipient_address: address,
        amount: u64
    ) acquires ReliefFund {
        let admin_address = signer::address_of(admin);
        let relief_fund = borrow_global_mut<ReliefFund>(admin_address);
        
        // Verify admin authorization
        assert!(admin_address == relief_fund.admin_address, 3);
        
        // Check if sufficient funds available and meets minimum distribution
        assert!(amount >= relief_fund.min_distribution, 1);
        assert!(relief_fund.total_donations >= relief_fund.total_distributed + amount, 2);
        
        // SECURITY: Verify recipient exists and is verified
        assert!(table::contains(&relief_fund.recipients, recipient_address), 4);
        let recipient_record = table::borrow_mut(&mut relief_fund.recipients, recipient_address);
        assert!(recipient_record.is_verified, 5);
        
        // Create fund signer from capability to withdraw from fund account
        let fund_signer = account::create_signer_with_capability(&relief_fund.fund_signer_cap);
        
        // Transfer funds directly from fund account to verified recipient
        let relief_payment = coin::withdraw<AptosCoin>(&fund_signer, amount);
        coin::deposit<AptosCoin>(recipient_address, relief_payment);
        
        // Update recipient record
        recipient_record.amount_received = recipient_record.amount_received + amount;
        recipient_record.last_distribution = timestamp::now_seconds();
        
        // Update fund records
        relief_fund.total_distributed = relief_fund.total_distributed + amount;
    }
}