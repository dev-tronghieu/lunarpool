import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Lunarpool } from "../target/types/lunarpool";
import { expect } from "chai";
import {
    Account,
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from "@solana/spl-token";

describe("lunarpool", () => {
    const wallet = anchor.Wallet.local();
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Lunarpool as Program<Lunarpool>;

    const poolKeypair = anchor.web3.Keypair.generate();
    const ownerKeypair = anchor.web3.Keypair.generate();
    const vaultKeypair = anchor.web3.Keypair.generate();
    let mintA: anchor.web3.PublicKey;
    let mintB: anchor.web3.PublicKey;
    const fee = 5;
    const feeAccountKeypair = anchor.web3.Keypair.generate();

    const userKeypair = anchor.web3.Keypair.generate();
    let userAtaA: Account;
    let userAtaB: Account;

    let latestBlockHash: {
        blockhash: string;
        lastValidBlockHeight: number;
    };

    const getAta = async (
        mint: anchor.web3.PublicKey,
        address: anchor.web3.PublicKey
    ) => {
        return await getOrCreateAssociatedTokenAccount(
            provider.connection,
            wallet.payer,
            mint,
            address
        );
    };

    it("Airdrop", async () => {
        latestBlockHash = await provider.connection.getLatestBlockhash();
        let airdropSig = await provider.connection.requestAirdrop(
            ownerKeypair.publicKey,
            10_000_000_000
        );

        await provider.connection.confirmTransaction(
            {
                signature: airdropSig,
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            },
            "confirmed"
        );

        airdropSig = await provider.connection.requestAirdrop(
            userKeypair.publicKey,
            10_000_000_000
        );

        await provider.connection.confirmTransaction(
            {
                signature: airdropSig,
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            },
            "confirmed"
        );
    });

    it("Mint", async () => {
        mintA = await createMint(
            provider.connection,
            wallet.payer,
            wallet.publicKey,
            null,
            6
        );

        mintB = await createMint(
            provider.connection,
            wallet.payer,
            wallet.publicKey,
            null,
            6
        );

        userAtaA = await getAta(mintA, userKeypair.publicKey);

        userAtaB = await getAta(mintB, userKeypair.publicKey);

        await mintTo(
            provider.connection,
            wallet.payer,
            mintA,
            userAtaA.address,
            wallet.payer,
            20 * 10 ** 6
        );

        await mintTo(
            provider.connection,
            wallet.payer,
            mintB,
            userAtaB.address,
            wallet.payer,
            25 * 10 ** 6
        );
    });

    it("Create Pool", async () => {
        await program.methods
            .createPool(mintA, mintB, fee, feeAccountKeypair.publicKey)
            .accounts({
                pool: poolKeypair.publicKey,
                owner: ownerKeypair.publicKey,
                vault: vaultKeypair.publicKey,
            })
            .signers([poolKeypair, ownerKeypair, vaultKeypair])
            .rpc();

        const pool = await program.account.pool.fetch(poolKeypair.publicKey);
        expect(pool.owner.toString()).to.equal(
            ownerKeypair.publicKey.toString()
        );
        expect(pool.mintA.toString()).to.equal(mintA.toString());
        expect(pool.mintB.toString()).to.equal(mintB.toString());
        expect(pool.fee).to.equal(fee);
        expect(pool.feeAccount.toString()).to.equal(
            feeAccountKeypair.publicKey.toString()
        );
    });
});
