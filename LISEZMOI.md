# 🎓 Atelier 1 — My First Audit-Ready Contract

> **Bienvenue !** Ce dossier contient votre starter kit.
> Votre mission : compléter le contrat ERC-20, écrire les tests, déployer sur Sepolia.
> Livrable : un repo GitHub public avec un badge CI vert et une adresse de contrat vérifié.

---

## 👉 Par où commencer ?

**Ouvrez le fichier `atelier1-apprenant.html` dans votre navigateur.**

C'est votre guide interactif pour tout l'atelier. Il contient les explications, les indices pour chaque TODO, et une checklist de progression que vous pouvez cocher au fur et à mesure.

---

## 📂 Ce que vous avez reçu

```
atelier1-starter/
│
├── 📖 atelier1-apprenant.html   ← COMMENCEZ ICI (guide interactif)
│
├── ✏️  contracts/AuditToken.sol  ← À COMPLÉTER  (15 TODO)
├── ✏️  test/AuditToken.test.js   ← À COMPLÉTER  (25 TODO)
│
├── ✅  scripts/deploy.js         ← Fourni, ne pas modifier
├── ✅  .github/workflows/ci.yml  ← Fourni, ne pas modifier
├── ✅  hardhat.config.js         ← Fourni, ne pas modifier
├── ✅  package.json              ← Fourni, ne pas modifier
└── ✅  .env.example              ← Modèle (à copier en .env)
```

Vous ne touchez qu'aux deux fichiers marqués ✏️.

---

## 🗂️ Étape 0 — Créer votre repo GitHub

**Faites ça en premier, avant de coder.**

GitHub est l'endroit où vous livrerez votre travail. Le dossier que vous avez reçu doit y être mis en ligne.

### 1. Créer le repo sur github.com

1. Allez sur [github.com](https://github.com) et connectez-vous
2. Cliquez sur **"New"** (bouton vert en haut à gauche)
3. Remplissez :
   - **Repository name** : `atelier1-audit-token` (ou ce que vous voulez)
   - **Visibility** : ✅ **Public** ← obligatoire pour les badges
   - **Initialize** : laissez tout décoché (on va pousser nos fichiers)
4. Cliquez **"Create repository"**

GitHub vous affiche alors une page avec des commandes. Ignorez-la pour l'instant.

### 2. Initialiser git dans votre dossier

Ouvrez un terminal dans le dossier starter, puis :

```bash
git init
git add .
git commit -m "feat: initial starter kit"
```

### 3. Connecter votre dossier au repo GitHub

Remplacez `VOTRE_USERNAME` par votre nom d'utilisateur GitHub :

```bash
git remote add origin https://github.com/VOTRE_USERNAME/atelier1-audit-token.git
git branch -M main
git push -u origin main
```

✅ Vos fichiers sont maintenant sur GitHub. La pipeline CI va démarrer (elle va échouer pour l'instant, c'est normal — le contrat est vide !).

---

## ⚙️ Étape 1 — Installer les dépendances

```bash
npm install
```

Vérifiez que tout fonctionne :

```bash
npm run compile   # doit afficher des erreurs (TODO non complétés, c'est normal)
```

---

## ✏️ Étape 2 — Compléter le contrat

Ouvrez `contracts/AuditToken.sol`.

Vous y trouverez **15 TODO numérotés** avec leurs indices. Complétez-les dans l'ordre. Après chaque groupe de TODO, recompilez :

```bash
npm run compile
```

Quand le contrat compile sans erreur, passez aux tests.

---

## 🧪 Étape 3 — Compléter les tests

Ouvrez `test/AuditToken.test.js`.

Les tests marqués `✅ EXEMPLE` sont fournis pour vous montrer le pattern. Complétez les **25 TODO** (T1 → T25). Lancez les tests régulièrement :

```bash
npm test                  # lancer les tests
npm run coverage          # voir le rapport de couverture
open coverage/index.html  # rapport HTML détaillé (Mac/Linux)
```

**Objectif** : tous les tests passent + couverture ≥ 95%.

---

## 🚀 Étape 4 — Déployer sur Sepolia

### Configurer l'environnement

```bash
cp .env.example .env
```

Ouvrez `.env` et remplissez :

| Variable | Où l'obtenir |
|---|---|
| `PRIVATE_KEY` | MetaMask → Détails du compte → Exporter la clé privée ⚠️ compte de test uniquement ! |
| `SEPOLIA_RPC_URL` | Compte gratuit sur [alchemy.com](https://www.alchemy.com) |
| `ETHERSCAN_API_KEY` | Compte gratuit sur [etherscan.io](https://etherscan.io/register) |

### Obtenir des ETH de test

- [sepoliafaucet.com](https://sepoliafaucet.com)
- [faucets.chain.link/sepolia](https://faucets.chain.link/sepolia)

### Déployer

```bash
npm run deploy:sepolia
```

Le script affiche l'adresse du contrat et vérifie automatiquement le code source sur Etherscan. **Notez l'adresse** — vous en aurez besoin pour votre README.

---

## 📝 Étape 5 — Compléter le README

Créez un fichier `README.md` à la racine du projet (remplacez les `???`) :

```markdown
# MonToken — Audit-Ready ERC-20

[![CI](https://github.com/VOTRE_USERNAME/atelier1-audit-token/actions/workflows/ci.yml/badge.svg)](https://github.com/VOTRE_USERNAME/atelier1-audit-token/actions)
[![Coverage](https://codecov.io/gh/VOTRE_USERNAME/atelier1-audit-token/branch/main/graph/badge.svg)](https://codecov.io/gh/VOTRE_USERNAME/atelier1-audit-token)

## Contrat déployé

- **Réseau** : Sepolia Testnet
- **Adresse** : `0x...` ← mettez votre adresse ici
- **Etherscan** : https://sepolia.etherscan.io/address/0x...

## Commandes

\`\`\`bash
npm install          # installer
npm test             # lancer les tests
npm run coverage     # rapport de couverture
npm run deploy:sepolia  # déployer
\`\`\`
```

---

## 📤 Étape 6 — Pousser et livrer

```bash
git add .
git commit -m "feat: completed AuditToken contract and tests"
git push
```

Allez sur votre repo GitHub et vérifiez que :
- ✅ Le badge CI est **vert** (Actions → onglet Actions)
- ✅ Le badge Coverage s'affiche (après avoir configuré Codecov)

**Soumettez l'URL de votre repo GitHub** — c'est votre livrable.

---

## 🆘 Besoin d'aide ?

- **Problème de compilation** → vérifiez les imports (TODO 1) et la déclaration `is` (TODO 3)
- **Test qui échoue** → lisez le message d'erreur, il indique la ligne exacte
- **RPC error** → vérifiez `SEPOLIA_RPC_URL` dans votre `.env`
- **Already verified** → normal, ignorez ce message

---

## ⚠️ Sécurité

- Ne committez **jamais** votre fichier `.env` (il est dans `.gitignore`)
- Utilisez un **compte MetaMask dédié aux tests**, pas votre wallet principal
- Ne mettez **jamais** de vraie crypto sur un compte de test
