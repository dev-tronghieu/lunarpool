use anchor_lang::prelude::*;

declare_id!("BScWpTj5Jyp9EJJoLaKMGLEoRAxVPXqr24kvU28NPVeH");

#[program]
pub mod lunarpool {
    use super::*;

    pub fn create_pool(
        ctx: Context<CreatePool>,
        mint_a: Pubkey,
        mint_b: Pubkey,
        fee: u8,
        fee_account: Pubkey,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.owner = *ctx.accounts.owner.key;
        pool.vault = *ctx.accounts.vault.key;
        pool.mint_a = mint_a;
        pool.mint_b = mint_b;
        pool.fee = fee;
        pool.fee_account = fee_account;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreatePool<'info> {
    #[account(init, payer = owner, space = 8 + Pool::MAX_SIZE)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub vault: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Pool {
    owner: Pubkey,       // 32
    vault: Pubkey,       // 32
    mint_a: Pubkey,      // 32
    mint_b: Pubkey,      // 32
    fee_account: Pubkey, // 32
    fee: u8,             // 1
}

impl Pool {
    pub const MAX_SIZE: usize = 32 + 32 + 32 + 32 + 32 + 1;
}
