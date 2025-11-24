# GUIDE: Transformer VTV en Application Android (.APK) pour Google Play

Puisque vous avez le code source, voici la procédure exacte pour créer le fichier d'installation Android.

## Prérequis
Vous devez avoir un ordinateur (PC ou Mac) avec :
1. **Node.js** installé.
2. **Android Studio** installé (logiciel gratuit de Google).

## Étape 1 : Télécharger le Code
Téléchargez tous les fichiers de ce projet dans un dossier sur votre ordinateur.

## Étape 2 : Installation des outils mobiles (Capacitor)
Ouvrez votre terminal (invite de commande) dans le dossier du projet et lancez ces commandes une par une :

```bash
# 1. Installer les dépendances de base
npm install

# 2. Installer Capacitor (le convertisseur Web vers Android)
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "VTV Streaming" "com.vtv.cinema" --web-dir=dist
```

*Note : "com.vtv.cinema" sera l'identifiant unique de votre app sur le Play Store.*

## Étape 3 : Construction de l'application
Toujours dans le terminal :

```bash
# 1. Créer la version optimisée du site
npm run build

# 2. Ajouter la plateforme Android
npx cap add android

# 3. Synchroniser le code avec Android
npx cap sync
```

## Étape 4 : Générer l'APK avec Android Studio
1. Lancez la commande : `npx cap open android`
2. Cela va ouvrir **Android Studio**.
3. Attendez que le projet charge (barre de progression en bas).
4. Dans le menu du haut, cliquez sur **Build > Generate Signed Bundle / APK**.
5. Choisissez **Android App Bundle (AAB)** pour le Google Play Store (ou **APK** pour tester sur votre téléphone directement).
6. Créez une "Key Store" (c'est votre signature numérique de créateur).
7. Cliquez sur **Finish**.

## Étape 5 : Publier sur Google Play
1. Créez un compte développeur Google (coût unique de 25$).
2. Allez sur la **Google Play Console**.
3. Cliquez sur "Créer une application".
4. Importez le fichier `.aab` généré à l'étape 4.
5. Remplissez la fiche (Nom : VTV, Description, Screenshots).
6. Envoyez pour examen !

## Fonctionnalités natives incluses
Ce code a été optimisé pour :
- Empêcher le zoom tactile (comportement app).
- Gérer le mode plein écran.
- Utiliser l'accélération matérielle du téléphone pour la vidéo.
