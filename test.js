import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

import * as fs from "fs";

const connection = new Connection(clusterApiUrl("devnet"));

// Step 1 - Create and fund wallet
/*
const wallet = Keypair.generate();
console.log(wallet.publicKey);

let txhash = await connection.requestAirdrop(ttt.publicKey, 100000);
console.log(`airdrop txhash: ${txhash}`);
*/

const pathToMyKeypair = "./wallet.json";
console.log(pathToMyKeypair);
const keypairFile = fs.readFileSync(pathToMyKeypair);
const secretKey = Buffer.from(JSON.parse(keypairFile.toString()));
const wallet = Keypair.fromSecretKey(secretKey);

let balance = await connection.getBalance(wallet.publicKey);
console.log(`${balance / LAMPORTS_PER_SOL} SOL`);

// Step 2 - Instantiate metaplex 
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(wallet))
  .use(
    bundlrStorage({
      address: "https://devnet.bundlr.network",
      providerUrl: "https://api.devnet.solana.com",
      timeout: 60000,
    })
  );

// Step 3 - Upload metadata
const { uri } = await metaplex
  .nfts()
  .uploadMetadata({
    name: "My NFT",
    description: "My description",
    image: "https://media.giphy.com/media/qYEwsbZWBk2HmIPZuL/giphy.gif",
  })
  .run();

console.log(uri);

// Step 4 - create NFT
const { nft } = await metaplex
  .nfts()
  .create({
    uri: uri,
    name: "My Test NFT",
    sellerFeeBasisPoints: 500, // Represents 5.00%.
  })
  .run();

console.log(nft);
