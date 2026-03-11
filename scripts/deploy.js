// scripts/deploy.js
// ─────────────────────────────────────────────────────────
//  ATELIER 1 — Script de déploiement
//
//  🎯 Ce script déploie votre contrat sur un testnet et le vérifie
//     automatiquement sur Etherscan.
//
//  ▶️  Usage :
//    npx hardhat run scripts/deploy.js --network sepolia
//
//  📋 Prérequis :
//    1. Fichier .env configuré (copiez .env.example → .env)
//    2. Compte avec ETH Sepolia de test :
//       → https://sepoliafaucet.com/
//       → https://faucets.chain.link/
//    3. Clé API Etherscan (gratuite) :
//       → https://etherscan.io/register
// ─────────────────────────────────────────────────────────

const { ethers, run, network } = require("hardhat");

async function main() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🚀 AuditToken — Déploiement");
  console.log(`  📡 Réseau : ${network.name}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ── 1. Récupérer le compte déployeur ──────────────────
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`🔑 Déployeur  : ${deployer.address}`);
  console.log(`💰 Balance    : ${ethers.formatEther(balance)} ETH`);

  // Vérification sécurité : ne pas déployer si balance trop faible
  if (balance < ethers.parseEther("0.01")) {
    console.log("\n⚠️  Balance insuffisante ! Obtenez des ETH de test sur :");
    console.log("   → https://sepoliafaucet.com/");
    process.exit(1);
  }

  // ── 2. Paramètres du token ─────────────────────────────
  // TODO [D1] — Personnalisez ces paramètres avec votre propre token !
  const TOKEN_NAME   = process.env.TOKEN_NAME   || "Audit Token";    // ← changez ici
  const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL || "AUT";            // ← et ici
  const INITIAL      = BigInt(process.env.INITIAL_SUPPLY || "1000");
  const MAX_SUPPLY   = BigInt(process.env.MAX_SUPPLY      || "10000");

  console.log(`\n📋 Paramètres du token :`);
  console.log(`   Nom        : ${TOKEN_NAME}`);
  console.log(`   Symbole    : ${TOKEN_SYMBOL}`);
  console.log(`   Offre init : ${INITIAL.toString()} tokens`);
  console.log(`   Offre max  : ${MAX_SUPPLY.toString()} tokens`);

  // ── 3. Déploiement ────────────────────────────────────
  console.log("\n⏳ Déploiement en cours...");

  const AuditToken = await ethers.getContractFactory("AuditToken");
  const token = await AuditToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL, MAX_SUPPLY);

  // Attendre que le contrat soit miné
  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log(`\n✅ Contrat déployé !`);
  console.log(`   Adresse  : ${address}`);
  console.log(`   TX Hash  : ${token.deploymentTransaction().hash}`);
  console.log(`   Voir sur : https://sepolia.etherscan.io/address/${address}`);

  // ── 4. Vérification Etherscan (si testnet) ─────────────
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n⏳ Attente de 6 confirmations avant vérification Etherscan...");
    await token.deploymentTransaction().wait(6);

    try {
      console.log("🔍 Vérification en cours...");
      await run("verify:verify", {
        address,
        constructorArguments: [TOKEN_NAME, TOKEN_SYMBOL, INITIAL, MAX_SUPPLY],
      });
      console.log("✅ Contrat vérifié sur Etherscan !");
      console.log(`   → https://sepolia.etherscan.io/address/${address}#code`);
    } catch (err) {
      if (err.message.includes("Already Verified")) {
        console.log("ℹ️  Déjà vérifié.");
      } else {
        console.warn("⚠️  Vérification échouée :", err.message);
        console.warn("   Relancez manuellement :");
        console.warn(`   npx hardhat verify --network ${network.name} ${address} "${TOKEN_NAME}" "${TOKEN_SYMBOL}" ${INITIAL} ${MAX_SUPPLY}`);
      }
    }
  }

  // ── 5. Résumé final ───────────────────────────────────
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ✅ DÉPLOIEMENT RÉUSSI");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Adresse contrat   : ${address}`);
  console.log(`  totalSupply       : ${ethers.formatEther(await token.totalSupply())} ${TOKEN_SYMBOL}`);
  console.log(`  remainingMintable : ${ethers.formatEther(await token.remainingMintable())} ${TOKEN_SYMBOL}`);
  console.log("\n  📝 Notez cette adresse pour votre README portfolio !");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Erreur :", error.message);
    process.exit(1);
  });
