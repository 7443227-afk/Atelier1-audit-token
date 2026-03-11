// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─────────────────────────────────────────────────────────────────────────────
//  ATELIER 1 — "My First Audit-Ready Contract"
//  Fichier : contracts/AuditToken.sol
//
//  🎯 OBJECTIF
//  Implémenter un token ERC-20 personnalisé "audit-ready" en complétant
//  les TODO ci-dessous. Chaque TODO est numéroté et accompagné d'un indice.
//
//  📋 CHECKLIST DE LIVRAISON
//  □ Tous les TODO implémentés
//  □ Contrat compilé sans warning
//  □ npx hardhat test → 100% passing
//  □ npx hardhat coverage → Statements/Branches/Functions/Lines ≥ 95%
//  □ NatSpec complet sur toutes les fonctions publiques
//  □ npx hardhat run scripts/deploy.js --network sepolia → succès
// ─────────────────────────────────────────────────────────────────────────────

// TODO [1] — Importez les contrats OpenZeppelin nécessaires :
//   • ERC20            (token de base)
//   • ERC20Burnable    (permet le burn)
//   • ERC20Pausable    (circuit-breaker)
//   • Ownable          (contrôle d'accès)
//   • ERC20Permit      (EIP-2612 : approve sans ETH)
//
//   💡 Indice : tous viennent de "@openzeppelin/contracts/token/erc20/..."
//              et "@openzeppelin/contracts/access/Ownable.sol"

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";


/**
 * @title AuditToken
 * @author 7443227-afk
 *
 * TODO [2] — Rédigez les tags NatSpec manquants :
 *   @notice  (description courte pour les utilisateurs)
 *   @dev     (détails techniques pour les développeurs)
 *
 * @notice ERC-20 "audit-ready" avec burn, pause, contrôle d'accès owner/minter et support Permit (EIP-2612).
 * @dev Hérite des modules OpenZeppelin ERC20, ERC20Burnable, ERC20Pausable, Ownable et ERC20Permit.
 */

// TODO [3] — Déclarez le contrat en héritant de TOUS les contrats importés.
//   💡 Syntaxe : contract NomContrat is A, B, C, D, E { ... }
contract AuditToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit {

    // ─────────────────────────────────────────────
    //  State variables
    // ─────────────────────────────────────────────

    // TODO [4] — Déclarez maxSupply :
    //   • Type    : uint256
    //   • Visibilité : public
    //   • Mutabilité : immutable  ← pourquoi immutable ? (répondez en commentaire)
    //   • 💡 Cette variable stocke le plafond absolu de tokens (en wei)
    uint256 public immutable maxSupply; // immutable: fixé au déploiement, non modifiable ensuite et moins coûteux en gas

    // TODO [5] — Déclarez minter :
    //   • Type    : address
    //   • Visibilité : public
    //   • 💡 Adresse autorisée à minter en plus du owner (peut être address(0))
    address public minter;

    // ─────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────

    // TODO [6] — Déclarez deux événements :
    //
    //   MinterUpdated  → émis quand le minter change
    //     params : address indexed previousMinter, address indexed newMinter
    //
    //   TokensMinted   → émis après chaque mint réussi
    //     params : address indexed to, uint256 amount
    //
    //   💡 Convention : les events commencent par une majuscule,
    //      les paramètres importants sont "indexed" (filtrables off-chain)

    event MinterUpdated(address indexed previousMinter, address indexed newMinter);
    event TokensMinted(address indexed to, uint256 amount);

    // ─────────────────────────────────────────────
    //  Custom Errors
    // ─────────────────────────────────────────────

    // TODO [7] — Déclarez 4 custom errors (plus gas-efficient que require + string) :
    //
    //   MaxSupplyExceeded(uint256 requested, uint256 available)
    //   Unauthorized(address caller)
    //   ZeroAddress()
    //   ZeroAmount()
    //
    //   💡 Syntaxe : error NomErreur(type param1, type param2);
    //   💡 Avantage gas : ~3x moins cher qu'un revert avec string

    error MaxSupplyExceeded(uint256 requested, uint256 available);
    error Unauthorized(address caller);
    error ZeroAddress();
    error ZeroAmount();

    // ─────────────────────────────────────────────
    //  Modifiers
    // ─────────────────────────────────────────────

    // TODO [8] — Créez le modifier onlyMinterOrOwner :
    //   • Autorise l'appel si msg.sender == owner() OU msg.sender == minter
    //   • Sinon, revert avec l'erreur Unauthorized(msg.sender)
    //   • N'oubliez pas le _; pour exécuter le corps de la fonction
    //
    //   💡 Rappel : owner() est une fonction héritée d'Ownable

    modifier onlyMinterOrOwner() {
        if (msg.sender != owner() && msg.sender != minter) {
            revert Unauthorized(msg.sender);
        }
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructor
    // ─────────────────────────────────────────────

    /**
     * @notice Déploie le token et mint l'offre initiale au déployeur
     *
     * TODO [9] — Complétez le NatSpec :
     * @dev Initialise ERC20, ERC20Permit et Ownable. Convertit les montants en wei (18 décimales).
     * @param name_         Nom du token
     * @param symbol_       Symbole du token
     * @param initialSupply Offre initiale en unités entières (avant décimales)
     * @param _maxSupply    Offre maximale en unités entières (avant décimales)
     */

    // TODO [10] — Implémentez le constructor :
    //   Signature : constructor(string memory name_, string memory symbol_,
    //                           uint256 initialSupply, uint256 _maxSupply)
    //
    //   Il doit appeler les constructeurs parents :
    //     • ERC20(name_, symbol_)
    //     • ERC20Permit(name_)        ← utilise le nom pour le domaine EIP-712
    //     • Ownable(msg.sender)
    //
    //   Corps :
    //     1. Vérifier que _maxSupply > 0  (sinon : ZeroAmount)
    //     2. Vérifier que initialSupply <= _maxSupply  (sinon : MaxSupplyExceeded)
    //        💡 Attention : _maxSupply est en unités entières, convertir en wei !
    //     3. Assigner maxSupply = _maxSupply * 10 ** decimals()
    //     4. Si initialSupply > 0, minter au msg.sender

    constructor(string memory name_, string memory symbol_, uint256 initialSupply, uint256 _maxSupply)
        ERC20(name_, symbol_)
        ERC20Permit(name_)
        Ownable(msg.sender)
    {
        if (_maxSupply == 0) revert ZeroAmount();

        uint256 unit = 10 ** decimals();
        uint256 maxSupplyWei = _maxSupply * unit;
        uint256 initialSupplyWei = initialSupply * unit;

        if (initialSupplyWei > maxSupplyWei) {
            revert MaxSupplyExceeded(initialSupplyWei, maxSupplyWei);
        }

        maxSupply = maxSupplyWei;

        if (initialSupply > 0) {
            _mint(msg.sender, initialSupplyWei);
        }
    }

    // ─────────────────────────────────────────────
    //  Owner / Minter functions
    // ─────────────────────────────────────────────

    /**
     * @notice Désigne un nouveau minter délégué
     * TODO [11] — Complétez les tags NatSpec (dev, param)
     * @dev Seul le owner peut modifier le minter. `address(0)` révoque le minter.
     * @param newMinter Adresse du nouveau minter délégué
     */

    // TODO [11] — Implémentez setMinter :
    //   • Visibilité : external
    //   • Guard : onlyOwner
    //   • Logique :
    //       1. Sauvegarder l'ancien minter dans une variable locale
    //       2. Assigner minter = newMinter
    //       3. Émettre MinterUpdated(ancien, nouveau)
    //   💡 address(0) doit être accepté → permet de révoquer le minter

    function setMinter(address newMinter) external onlyOwner {
        address previousMinter = minter;
        minter = newMinter;
        emit MinterUpdated(previousMinter, newMinter);
    }

    /**
     * @notice Crée de nouveaux tokens en faveur de `to`
     * TODO [12] — Complétez les tags NatSpec (dev, param x2)
     * @dev Callable uniquement par owner/minter quand le contrat n'est pas en pause. Respecte maxSupply.
     * @param to     Adresse bénéficiaire des tokens mintés
     * @param amount Quantité de tokens à minter (en wei)
     */

    // TODO [12] — Implémentez mint :
    //   • Visibilité : external
    //   • Guards : onlyMinterOrOwner, whenNotPaused
    //   • Validations (dans l'ordre) :
    //       1. to != address(0)                    → ZeroAddress()
    //       2. amount != 0                         → ZeroAmount()
    //       3. amount <= (maxSupply - totalSupply) → MaxSupplyExceeded(amount, available)
    //   • Action : _mint(to, amount)
    //   • Event  : TokensMinted(to, amount)

    function mint(address to, uint256 amount) external onlyMinterOrOwner whenNotPaused {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        uint256 available = maxSupply - totalSupply();
        if (amount > available) {
            revert MaxSupplyExceeded(amount, available);
        }

        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @notice Suspend tous les transferts (mode urgence)
     * TODO [13] — Ajoutez dev et implémentez pause()
     * @dev Seul le owner peut activer la pause globale (circuit-breaker).
     */

    // TODO [13] — pause() et unpause() :
    //   • Visibilité : external
    //   • Guard : onlyOwner
    //   • Délèguent respectivement à _pause() et _unpause() (hérités de Pausable)

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ─────────────────────────────────────────────
    //  View helpers
    // ─────────────────────────────────────────────

    /**
     * @notice Retourne le montant de tokens encore mintables
     * @return Quantité disponible avant d'atteindre maxSupply (en wei)
     */

    // TODO [14] — Implémentez remainingMintable() :
    //   • Visibilité : external view
    //   • Retourne : maxSupply - totalSupply()

    function remainingMintable() external view returns (uint256) {
        return maxSupply - totalSupply();
    }

    // ─────────────────────────────────────────────
    //  Required overrides
    // ─────────────────────────────────────────────

    // TODO [15] — Override _update pour résoudre le conflit ERC20 / ERC20Pausable :
    //
    //   Solidity exige un override explicite quand deux parents définissent
    //   la même fonction. Ici ERC20 et ERC20Pausable définissent _update.
    //
    //   💡 Syntaxe :
    //   function _update(address from, address to, uint256 value)
    //       internal override(ERC20, ERC20Pausable) {
    //       super._update(from, to, value);
    //   }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
