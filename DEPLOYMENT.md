
# GUIDE: OBTENIR VOTRE LIEN INTERNET (URL)

Pour que vos clients puissent accéder à VTV, vous devez héberger le site. Voici la méthode la plus simple et gratuite.

## Option 1 : Vercel (Recommandé, le plus rapide)

1. **Téléchargez** tous les fichiers de ce projet sur votre ordinateur.
2. Allez sur le site [vercel.com](https://vercel.com/signup) et créez un compte gratuit.
3. Installez "Vercel CLI" sur votre ordinateur OU utilisez leur interface web pour importer un projet GitHub.
   *(Le plus simple si vous ne connaissez pas GitHub est d'utiliser "Netlify Drop" ci-dessous)*.

## Option 2 : Netlify Drop (Le plus simple pour les débutants)

1. **Téléchargez** le projet.
2. Dans le dossier du projet, ouvrez un terminal et tapez :
   `npm run build`
   Cela va créer un dossier nommé `dist`.
3. Allez sur [app.netlify.com/drop](https://app.netlify.com/drop).
4. **Glissez le dossier `dist`** directement sur la page web.
5. Netlify va vous donner un lien du type `https://vtv-cinema.netlify.app` en quelques secondes.
6. C'est tout ! Vous pouvez partager ce lien.

## Option 3 : Configuration Professionnelle

Pour avoir `www.vtv.com` :
1. Achetez le nom de domaine sur Namecheap ou Google Domains (~10€/an).
2. Dans les paramètres Netlify ou Vercel, allez dans "Domains".
3. Ajoutez votre domaine acheté.
