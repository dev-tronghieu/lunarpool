use anchor_lang::prelude::*;

declare_id!("BScWpTj5Jyp9EJJoLaKMGLEoRAxVPXqr24kvU28NPVeH");

#[program]
pub mod lunarpool {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
