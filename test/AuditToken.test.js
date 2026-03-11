// test/AuditToken.test.js
// ─────────────────────────────────────────────────────────────────────────────
//  ATELIER 1 — Suite de tests unitaires
//
//  🎯 OBJECTIF
//  Compléter les tests manquants pour atteindre ≥ 95% de couverture.
//  Les tests existants (✅) vous montrent le pattern à suivre.
//  Les tests à compléter (TODO) sont marqués clairement.
//
//  ▶️  Lancer les tests    : npx hardhat test
//  📊 Rapport couverture  : npx hardhat coverage
//  🔍 Voir le rapport HTML: open coverage/index.html
// ─────────────────────────────────────────────────────────────────────────────

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("AuditToken", function () {

  // ══════════════════════════════════════════════
  //  📌 FIXTURE — Partagée entre tous les tests
  //
  //  loadFixture() redéploie proprement le contrat avant chaque test.
  //  C'est le pattern recommandé Hardhat (plus rapide qu'un beforeEach).
  // ══════════════════════════════════════════════

  async function deployFixture() {
    // Récupérer 4 comptes de test (Hardhat en fournit 20 par défaut)
    const [owner, alice, bob, charlie] = await ethers.getSigners();

    const TOKEN_NAME   = "Audit Token";
    const TOKEN_SYMBOL = "AUT";
    const INITIAL      = 1_000n;     // 1 000 tokens (en unités entières)
    const MAX_SUPPLY   = 10_000n;    // 10 000 tokens (en unités entières)
    const ONE_TOKEN    = 10n ** 18n; // 1 token en wei (18 décimales)

    // Déploiement du contrat
    const AuditToken = await ethers.getContractFactory("AuditToken");
    const token = await AuditToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL, MAX_SUPPLY);

    return { token, owner, alice, bob, charlie, INITIAL, MAX_SUPPLY, ONE_TOKEN };
  }

  // ══════════════════════════════════════════════
  //  1. DEPLOYMENT
  //  Vérifie que le contrat est correctement initialisé
  // ══════════════════════════════════════════════

  describe("Deployment", function () {

    // ✅ EXEMPLE — Test complet fourni pour vous montrer le pattern
    it("should set correct name and symbol", async function () {
      const { token } = await loadFixture(deployFixture);
      expect(await token.name()).to.equal("Audit Token");
      expect(await token.symbol()).to.equal("AUT");
    });

    // ✅ EXEMPLE — Vérification du supply initial
    it("should mint initial supply to deployer", async function () {
      const { token, owner, INITIAL, ONE_TOKEN } = await loadFixture(deployFixture);
      // INITIAL = 1000 tokens, converti en wei = 1000 * 10^18
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL * ONE_TOKEN);
    });

    // TODO [T1] — Vérifiez que decimals() retourne 18
    it("should set 18 decimals", async function () {
      const { token } = await loadFixture(deployFixture);
      expect(await token.decimals()).to.equal(18);
    });

    // TODO [T2] — Vérifiez que maxSupply est correct
    //   💡 maxSupply stocke la valeur en wei (MAX_SUPPLY * ONE_TOKEN)
    it("should set maxSupply correctly", async function () {
      const { token, MAX_SUPPLY, ONE_TOKEN } = await loadFixture(deployFixture);
      expect(await token.maxSupply()).to.equal(MAX_SUPPLY * ONE_TOKEN);
    });

    // TODO [T3] — Vérifiez que le owner est bien le déployeur
    //   💡 owner() est une fonction héritée d'Ownable
    it("should set owner to deployer", async function () {
      const { token, owner } = await loadFixture(deployFixture);
      expect(await token.owner()).to.equal(owner.address);
    });

    // TODO [T4] — Vérifiez que minter vaut address(0) par défaut
    //   💡 ethers.ZeroAddress représente "0x0000...0000"
    it("should have no minter by default", async function () {
      const { token } = await loadFixture(deployFixture);
      expect(await token.minter()).to.equal(ethers.ZeroAddress);
    });

    // TODO [T5] — Vérifiez que le deploy échoue si initialSupply > maxSupply
    //   💡 revertedWithCustomError(contract, "NomDeLErreur")
    it("should revert if initialSupply > maxSupply", async function () {
      const AuditToken = await ethers.getContractFactory("AuditToken");
      await expect(
        AuditToken.deploy("T", "T", 5000n, 100n) // 5000 > 100 → doit revert
      ).to.be.revertedWithCustomError(AuditToken, "MaxSupplyExceeded");
    });
  });

  // ══════════════════════════════════════════════
  //  2. ERC-20 STANDARD
  //  Vérifie les fonctions de base transfer, approve, transferFrom
  // ══════════════════════════════════════════════

  describe("ERC-20 standard", function () {

    // ✅ EXEMPLE
    it("should transfer tokens between accounts", async function () {
      const { token, owner, alice, ONE_TOKEN } = await loadFixture(deployFixture);
      const amount = 100n * ONE_TOKEN;

      await token.connect(owner).transfer(alice.address, amount);

      expect(await token.balanceOf(alice.address)).to.equal(amount);
    });

    // ✅ EXEMPLE — Test d'un revert
    it("should fail transfer with insufficient balance", async function () {
      const { token, alice, bob, ONE_TOKEN } = await loadFixture(deployFixture);
      // alice n'a aucun token au départ
      await expect(
        token.connect(alice).transfer(bob.address, ONE_TOKEN)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });

    // TODO [T6] — Vérifiez qu'approve met à jour l'allowance correctement
    //   💡 token.allowance(owner, spender) retourne le montant autorisé
    it("should update allowance via approve", async function () {
      const { token, owner, alice, ONE_TOKEN } = await loadFixture(deployFixture);
      const amount = 50n * ONE_TOKEN;

      await token.connect(owner).approve(alice.address, amount);

      expect(await token.allowance(owner.address, alice.address)).to.equal(amount);
    });

    // TODO [T7] — Vérifiez que transferFrom fonctionne dans la limite de l'allowance
    //   Scénario : owner approve alice, alice transferFrom owner vers bob
    it("should transferFrom within allowance", async function () {
      const { token, owner, alice, bob, ONE_TOKEN } = await loadFixture(deployFixture);
      const amount = 75n * ONE_TOKEN;

      await token.connect(owner).approve(alice.address, amount);
      await token.connect(alice).transferFrom(owner.address, bob.address, amount);

      expect(await token.balanceOf(bob.address)).to.equal(amount);
      expect(await token.allowance(owner.address, alice.address)).to.equal(0);
    });

    // TODO [T8] — Vérifiez que Transfer event est émis lors d'un transfer
    //   💡 .to.emit(contract, "NomEvent").withArgs(arg1, arg2, arg3)
    it("should emit Transfer event", async function () {
      const { token, owner, alice, ONE_TOKEN } = await loadFixture(deployFixture);
      await expect(token.connect(owner).transfer(alice.address, ONE_TOKEN))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, alice.address, ONE_TOKEN);
    });
  });

  // ══════════════════════════════════════════════
  //  3. MINT
  //  Vérifie la logique de création de nouveaux tokens
  // ══════════════════════════════════════════════

  describe("Mint", function () {

    // ✅ EXEMPLE
    it("should let owner mint tokens", async function () {
      const { token, owner, alice, ONE_TOKEN } = await loadFixture(deployFixture);
      const amount = 500n * ONE_TOKEN;

      await token.connect(owner).mint(alice.address, amount);

      expect(await token.balanceOf(alice.address)).to.equal(amount);
    });

    // TODO [T9] — Vérifiez que TokensMinted event est émis
    it("should emit TokensMinted event", async function () {
      const { token, owner, alice, ONE_TOKEN } = await loadFixture(deployFixture);
      const amount = 25n * ONE_TOKEN;

      await expect(token.connect(owner).mint(alice.address, amount))
        .to.emit(token, "TokensMinted")
        .withArgs(alice.address, amount);
    });

    // TODO [T10] — Vérifiez que le minter délégué peut minter
    //   Scénario : owner setMinter(alice), alice mint vers bob
    it("should let minter delegate mint", async function () {
      const { token, owner, alice, bob, ONE_TOKEN } = await loadFixture(deployFixture);
      const amount = 40n * ONE_TOKEN;

      await token.connect(owner).setMinter(alice.address);
      await token.connect(alice).mint(bob.address, amount);

      expect(await token.balanceOf(bob.address)).to.equal(amount);
    });

    // TODO [T11] — Vérifiez que mint échoue si appelé par un inconnu (ni owner ni minter)
    it("should revert mint from unauthorized caller", async function () {
      const { token, alice, bob, ONE_TOKEN } = await loadFixture(deployFixture);
      await expect(
        token.connect(alice).mint(bob.address, ONE_TOKEN)
      ).to.be.revertedWithCustomError(token, "Unauthorized")
        .withArgs(alice.address);
    });

    // TODO [T12] — Vérifiez que mint échoue vers address(0)
    it("should revert mint to zero address", async function () {
      const { token, owner, ONE_TOKEN } = await loadFixture(deployFixture);
      await expect(
        token.connect(owner).mint(ethers.ZeroAddress, ONE_TOKEN)
      ).to.be.revertedWithCustomError(token, "ZeroAddress");
    });

    // TODO [T13] — Vérifiez que mint échoue si amount == 0
    it("should revert mint of zero amount", async function () {
      const { token, owner, alice } = await loadFixture(deployFixture);
      await expect(
        token.connect(owner).mint(alice.address, 0)
      ).to.be.revertedWithCustomError(token, "ZeroAmount");
    });

    // TODO [T14] — Vérifiez que mint échoue si on dépasse maxSupply
    //   💡 INITIAL = 1000 tokens déjà mintés, MAX_SUPPLY = 10 000
    //      Essayez de minter MAX_SUPPLY tokens en plus → overflow !
    it("should revert when mint exceeds maxSupply", async function () {
      const { token, owner, alice, MAX_SUPPLY, ONE_TOKEN } = await loadFixture(deployFixture);
      const amount = MAX_SUPPLY * ONE_TOKEN;

      await expect(
        token.connect(owner).mint(alice.address, amount)
      ).to.be.revertedWithCustomError(token, "MaxSupplyExceeded");
    });

    // ✅ EXEMPLE — Test de remainingMintable
    it("should correctly track remainingMintable", async function () {
      const { token, owner, alice, INITIAL, MAX_SUPPLY, ONE_TOKEN } = await loadFixture(deployFixture);

      // Au départ : disponible = max - initial
      const expected = (MAX_SUPPLY - INITIAL) * ONE_TOKEN;
      expect(await token.remainingMintable()).to.equal(expected);

      // Après un mint de 100, le disponible diminue
      const amount = 100n * ONE_TOKEN;
      await token.connect(owner).mint(alice.address, amount);
      expect(await token.remainingMintable()).to.equal(expected - amount);
    });
  });

  // ══════════════════════════════════════════════
  //  4. BURN
  //  Vérifie la destruction de tokens
  // ══════════════════════════════════════════════

  describe("Burn", function () {

    // TODO [T15] — Vérifiez qu'un holder peut brûler ses propres tokens
    //   💡 burn() réduit le balance ET le totalSupply
    it("should let holder burn their own tokens", async function () {
      const { token, owner, ONE_TOKEN } = await loadFixture(deployFixture);
      const amount = 10n * ONE_TOKEN;
      const initialSupply = await token.totalSupply();

      await token.connect(owner).burn(amount);

      expect(await token.balanceOf(owner.address)).to.equal(990n * ONE_TOKEN);
      expect(await token.totalSupply()).to.equal(initialSupply - amount);
    });

    // TODO [T16] — Vérifiez que burnFrom fonctionne avec allowance
    //   Scénario : owner approve alice, alice burnFrom(owner, amount)
    it("should let spender burnFrom within allowance", async function () {
      const { token, owner, alice, ONE_TOKEN } = await loadFixture(deployFixture);
      const amount = 20n * ONE_TOKEN;
      const initialSupply = await token.totalSupply();

      await token.connect(owner).approve(alice.address, amount);
      await token.connect(alice).burnFrom(owner.address, amount);

      expect(await token.balanceOf(owner.address)).to.equal(980n * ONE_TOKEN);
      expect(await token.totalSupply()).to.equal(initialSupply - amount);
      expect(await token.allowance(owner.address, alice.address)).to.equal(0);
    });

    // TODO [T17] — Vérifiez que burn échoue sans solde suffisant
    it("should revert burn with insufficient balance", async function () {
      const { token, alice, ONE_TOKEN } = await loadFixture(deployFixture);
      await expect(
        token.connect(alice).burn(ONE_TOKEN)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });
  });

  // ══════════════════════════════════════════════
  //  5. PAUSE
  //  Vérifie le circuit-breaker d'urgence
  // ══════════════════════════════════════════════

  describe("Pause", function () {

    // ✅ EXEMPLE
    it("should allow owner to pause and block transfers", async function () {
      const { token, owner, alice, ONE_TOKEN } = await loadFixture(deployFixture);

      // Pause
      await token.connect(owner).pause();
      expect(await token.paused()).to.equal(true);

      // Transfer bloqué
      await expect(
        token.connect(owner).transfer(alice.address, ONE_TOKEN)
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });

    // TODO [T18] — Vérifiez que unpause reprend les transferts
    it("should resume transfers after unpause", async function () {
      const { token, owner, alice, ONE_TOKEN } = await loadFixture(deployFixture);
      await token.connect(owner).pause();
      await token.connect(owner).unpause();

      await expect(token.connect(owner).transfer(alice.address, ONE_TOKEN))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, alice.address, ONE_TOKEN);
    });

    // TODO [T19] — Vérifiez que mint est aussi bloqué pendant la pause
    it("should block mint when paused", async function () {
      const { token, owner, alice, ONE_TOKEN } = await loadFixture(deployFixture);
      await token.connect(owner).pause();

      await expect(
        token.connect(owner).mint(alice.address, ONE_TOKEN)
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });

    // TODO [T20] — Vérifiez que pause() échoue si appelé par un non-owner
    //   💡 L'erreur Ownable s'appelle "OwnableUnauthorizedAccount"
    it("should revert pause from non-owner", async function () {
      const { token, alice } = await loadFixture(deployFixture);
      await expect(
        token.connect(alice).pause()
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
        .withArgs(alice.address);
    });
  });

  // ══════════════════════════════════════════════
  //  6. MINTER MANAGEMENT
  // ══════════════════════════════════════════════

  describe("Minter management", function () {

    // ✅ EXEMPLE
    it("should let owner set a new minter and emit event", async function () {
      const { token, owner, alice } = await loadFixture(deployFixture);

      await expect(token.connect(owner).setMinter(alice.address))
        .to.emit(token, "MinterUpdated")
        .withArgs(ethers.ZeroAddress, alice.address);

      expect(await token.minter()).to.equal(alice.address);
    });

    // TODO [T21] — Vérifiez qu'on peut révoquer le minter (setMinter(address(0)))
    it("should allow revoking minter by setting to zero address", async function () {
      const { token, owner, alice } = await loadFixture(deployFixture);
      await token.connect(owner).setMinter(alice.address);

      await expect(token.connect(owner).setMinter(ethers.ZeroAddress))
        .to.emit(token, "MinterUpdated")
        .withArgs(alice.address, ethers.ZeroAddress);

      expect(await token.minter()).to.equal(ethers.ZeroAddress);
    });

    // TODO [T22] — Vérifiez que setMinter échoue si appelé par un non-owner
    it("should revert setMinter from non-owner", async function () {
      const { token, alice, bob } = await loadFixture(deployFixture);
      await expect(
        token.connect(alice).setMinter(bob.address)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
        .withArgs(alice.address);
    });
  });

  // ══════════════════════════════════════════════
  //  7. PERMIT (EIP-2612) — BONUS ⭐
  //  Approve sans transaction ETH via signature off-chain
  // ══════════════════════════════════════════════

  describe("Permit (EIP-2612) ⭐ BONUS", function () {

    // ✅ EXEMPLE COMPLET — Ce test est fourni car il est complexe
    //    Lisez-le attentivement pour comprendre comment fonctionne EIP-2612
    it("should approve via permit signature", async function () {
      const { token, owner, alice, ONE_TOKEN } = await loadFixture(deployFixture);

      const nonce    = await token.nonces(owner.address);       // anti-replay
      const deadline = Math.floor(Date.now() / 1000) + 3600;   // expire dans 1h
      const amount   = 100n * ONE_TOKEN;

      // Domaine EIP-712 (identifie le contrat de manière unique)
      const domain = {
        name    : await token.name(),
        version : "1",
        chainId : (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await token.getAddress(),
      };

      // Types EIP-712 pour Permit
      const types = {
        Permit: [
          { name: "owner",    type: "address" },
          { name: "spender",  type: "address" },
          { name: "value",    type: "uint256" },
          { name: "nonce",    type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      // Données à signer
      const permitData = {
        owner   : owner.address,
        spender : alice.address,
        value   : amount,
        nonce   : nonce,
        deadline: deadline,
      };

      // Signature off-chain (pas de transaction, pas de gas !)
      const sig = await owner.signTypedData(domain, types, permitData);
      const { v, r, s } = ethers.Signature.from(sig);

      // Soumission on-chain de la signature (par n'importe qui)
      await token.permit(owner.address, alice.address, amount, deadline, v, r, s);

      // L'allowance est maintenant définie sans que owner ait payé de gas
      expect(await token.allowance(owner.address, alice.address)).to.equal(amount);
    });

    // TODO [T23] — BONUS : Vérifiez que permit échoue avec un deadline expiré
    //   💡 deadline = 1n (très dans le passé)
    //   💡 L'erreur s'appelle "ERC2612ExpiredSignature"
    it("should revert permit with expired deadline", async function () {
      const { token, owner, alice, ONE_TOKEN } = await loadFixture(deployFixture);
      const nonce = await token.nonces(owner.address);
      const deadline = 1n;
      const amount = 100n * ONE_TOKEN;

      const domain = {
        name: await token.name(),
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await token.getAddress(),
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const permitData = {
        owner: owner.address,
        spender: alice.address,
        value: amount,
        nonce,
        deadline,
      };

      const sig = await owner.signTypedData(domain, types, permitData);
      const { v, r, s } = ethers.Signature.from(sig);

      await expect(
        token.permit(owner.address, alice.address, amount, deadline, v, r, s)
      ).to.be.revertedWithCustomError(token, "ERC2612ExpiredSignature");
    });
  });

  // ══════════════════════════════════════════════
  //  8. TEST D'INTÉGRATION — BONUS ⭐⭐
  //  Scénario de bout en bout
  // ══════════════════════════════════════════════

  describe("Integration scenario ⭐⭐ BONUS", function () {

    // TODO [T24] — BONUS : Écrivez un test de bout en bout :
    //   Scénario "cycle de vie complet" :
    //   1. owner mint 100 tokens à alice
    //   2. alice transfère 40 tokens à bob
    //   3. bob brûle 10 tokens
    //   4. Vérifiez le solde final de chacun ET le totalSupply
    //
    //   Valeurs attendues :
    //     alice.balance  = 60 tokens
    //     bob.balance    = 30 tokens
    //     totalSupply    = (1000 + 100 - 10) tokens = 1090 tokens
    it("full lifecycle: mint → transfer → burn", async function () {
      const { token, owner, alice, bob, INITIAL, ONE_TOKEN } = await loadFixture(deployFixture);
      const mintAmount = 100n * ONE_TOKEN;
      const transferAmount = 40n * ONE_TOKEN;
      const burnAmount = 10n * ONE_TOKEN;

      await token.connect(owner).mint(alice.address, mintAmount);
      await token.connect(alice).transfer(bob.address, transferAmount);
      await token.connect(bob).burn(burnAmount);

      expect(await token.balanceOf(alice.address)).to.equal(60n * ONE_TOKEN);
      expect(await token.balanceOf(bob.address)).to.equal(30n * ONE_TOKEN);
      expect(await token.totalSupply()).to.equal((INITIAL + 100n - 10n) * ONE_TOKEN);
    });

    // TODO [T25] — BONUS : Vérifiez qu'on peut atteindre exactement maxSupply
    //   💡 remainingMintable() doit valoir 0 après
    it("should reach exactly maxSupply", async function () {
      const { token, owner, alice, INITIAL, MAX_SUPPLY, ONE_TOKEN } = await loadFixture(deployFixture);
      const remaining = (MAX_SUPPLY - INITIAL) * ONE_TOKEN;

      await token.connect(owner).mint(alice.address, remaining);

      expect(await token.totalSupply()).to.equal(MAX_SUPPLY * ONE_TOKEN);
      expect(await token.remainingMintable()).to.equal(0);
    });
  });
});
