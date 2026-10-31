# Ruth — Le garage créatif

## Bureau du PC

Après l’introduction, le site ouvre directement un écran d’ordinateur. Le bureau propose des raccourcis vers les projets, les jeux, la 3D, le graphisme, le code et le parcours. Les projets s’affichent dans une fenêtre avec recherche, filtres et pagination ; elle peut être réduite dans la barre des tâches, restaurée, agrandie ou fermée. « Retour au garage » ferme le PC et rend la scène 3D accessible. Le PC reste accessible depuis l’ordinateur de l’atelier.

`dist/pc-desktop.js` gère le bureau, les fenêtres et l’entrée automatique après l’accueil ; `dist/pc-desktop.css` définit l’écran, les icônes et l’adaptation mobile. Les projets et leurs lecteurs existants restent dans `immersive.js`.

## Filtres par technologie

Le catalogue combine les catégories existantes avec les filtres Unity, Unreal et AR. Les technologies sont reconnues à partir des compétences déclarées dans chaque fiche : AR désigne la réalité augmentée, sans inclure le nom de l’entreprise AR Compétences. La recherche et la pagination respectent les deux groupes de filtres. Ouvrir un dossier du bureau réinitialise le filtre technologique. `dist/project-filters.js` contient les règles de classement.

## Adaptation mobile et tablette

`dist/responsive.css`, chargé après les thèmes, adapte le bureau, les fiches, le parcours et les commandes du garage aux petits écrans et aux fenêtres courtes. Les catalogues passent à deux colonnes sur tablette, puis à une colonne jusqu’à 400 px. Les contenus longs se parcourent par défilement, les commandes tactiles mesurent au moins 44 px et les marges respectent les encoches du téléphone. Les fiches conservent leurs descriptions complètes et leur bouton de fermeture accessible pendant le défilement.

Sur écran tactile, ouvrir un dossier ne déclenche pas le clavier de recherche. La pagination ramène au premier projet de la nouvelle page. L’affichage de bureau conserve sa présentation sur grand écran.

## Publication sur GitHub Pages

Le dossier `dist/` contient le site statique prêt à publier, sans installation ni compilation. Le workflow `.github/workflows/pages.yml` publie uniquement ce dossier après chaque push sur `main`. Dans les paramètres GitHub du dépôt, la source de Pages doit être « GitHub Actions ».

Les chemins des ressources sont relatifs pour fonctionner aussi sous l’adresse d’un dépôt (`/garage-portfolio/`). Les polices, scripts, modèles et médias restent embarqués dans le site. Les licences et attributions se trouvent dans `dist/vendor/LICENSE` et `dist/assets/`.

Le dépôt Git dédié à ce site exclut les recherches, captures de contrôle, fichiers Blender de travail, configuration Sites locale et archives. Ces fichiers restent présents sur le poste. Les notes de fabrication ci-dessous décrivent également ces sources locales ; elles ne sont pas toutes distribuées sur GitHub.

Pour modifier le site : éditer `dist/`, vérifier l’aperçu avec `python serve.py`, puis committer et pousser sur `main`.

Portfolio immersif sur un seul écran : quartier et atelier aux surfaces lisses créés dans Blender 4.0 à partir du croquis de Ruth, 23 fiches documentées à partir des archives et consultation de 12 modèles issus des projets. Aucune section à faire défiler sur la page.

## Ouvrir et modifier

- `blender/ruth-garage.blend` : scène native entièrement modifiable, caméra et éclairage inclus.
- `blender/build_neighborhood.py` : génération de la scène actuelle et export GLB, depuis `blender/garage-interior-base.blend`.
- `blender/neighborhood.py` : maison, jardin, rue et façade.
- `blender/build_immersive.py` : générateur historique de la base du garage.
- `blender/import_miata.py` : import fidèle de la Mazda fournie par Ruth, créée par crubennatan sur CGTrader ; source embarquée et attribution dans `dist/assets/credits.txt`. Les pièces des phares d’origine sont séparées par `refine_headlights.py` puis animées dans le navigateur.
- `blender/import_motorcycle.py` et `place_motorcycle.py` : Kawasaki Ninja fournie, garée à gauche sur un prolongement du dallage de l’accès.
- `blender/harmonize_materials.py` et `palette.json` : palette ivoire, pétrole, bois et accents corail.
- `blender/laptop_display.py` : aperçu des démos sur l’écran du PC.
- `blender/refine_desk.py`, `refine_tires.py`, `refine_tools.py` : bureau au fond, pneus et outils détaillés.
- `blender/refine_hedges.py` : haies carrées avec feuilles et fleurs.
- `blender/sports_car.py` : ancien modèle généré, conservé pour historique mais inutilisé.
- `dist/index.html`, `dist/immersive.css`, `dist/immersive.js`, `dist/garage-scene.js` : interface plein écran et exploration du garage. `style.css` fournit les styles communs des fiches.
- `dist/demos.js` : mini-course, mini-golf et génération de maison.
- `dist/projects.json` : descriptions, catégories, sources et modèles des 23 projets.
- `dist/assets/models` : 12 modèles GLB pour le navigateur.

Pour l’aperçu local : lancer `python serve.py` dans ce dossier, puis ouvrir http://127.0.0.1:4174. Ce serveur configure les types MIME JavaScript, y compris sous Windows. Lancer un serveur HTTP est nécessaire pour charger les modules et les modèles ; le double-clic sur index.html ne suffit pas.

## Interaction

La première vue montre la rue, la petite maison, le jardin et la Kawasaki à côté du garage. Le bouton « La moto » ou un clic sur celle-ci rapproche la caméra. « Ouvrir le garage » anime la porte et approche la caméra de l’atelier ; « Retour à la rue » permet de ressortir. Glisser pour regarder autour de soi et utiliser la molette, le pincement ou les boutons + / − pour rapprocher ou éloigner la vue. Cliquer sur un objet ou les six boutons de vue pour observer la voiture, les outils, l’établi ou le rangement des pneus. Le PC portable et le bouton « Ouvrir le PC » ouvrent d’abord les deux mini-démos jouables avec des captures et un accès direct. Les autres filtres donnent accès aux 23 projets. Dans une fiche, faire tourner les modèles, afficher le maillage, changer de modèle, consulter les sources ou jouer à une mini-démo. Les commandes en haut à droite changent l’éclairage, activent le plein écran et affichent l’aide.

La scène comprend les LED hexagonales du plafond, les étagères à bidons et outils, la caisse à tiroirs, une Mazda MX-5 NA rouge (échelle de présentation augmentée de 25 %), le cric, le rangement à pneus, l’armoire, les outils muraux, l’établi, le coin café, le bureau au fond et son PC, le tabouret, le volet de garage et la grille au sol.

Les bulles « Mon portfolio » et « Mon parcours » relient les bâtiments à leur contenu. Un contour animé signale le garage. La maison présente les expériences, formations et compétences du CV fourni, sans coordonnées privées.

## Périmètre de cette version

Les archives originales restent inchangées dans le dossier fourni. Les descriptions correspondent aux fichiers inspectés ; elles ne prétendent pas que tous les projets ont été exécutés. Les modèles extraits conservent leur géométrie, avec une nouvelle palette pastel commune et une pose statique. Leur présence dans un projet ne revendique pas la création personnelle de chaque asset.

Aucun gameplay original ni build web n’a été trouvé dans les archives. Les mini-démos de Gy-RACE et MiniGolf, ainsi que la génération de maison, sont des adaptations de présentation créées pour ce portfolio, clairement signalées dans les fiches. Les autres jeux Unreal/Unity disposent de fiches documentées ; leurs captures ou builds jouables originaux restent à intégrer. Les archives préparatoires sont signalées comme telles.

La recherche des sources et la traçabilité des ressources sont conservées dans le dossier frère `research`. Le garage actuel se régénère depuis les sources embarquées avec `blender --background --disable-autoexec --python blender/build_neighborhood.py`. Les scripts historiques d’extraction des modèles des projets requièrent les FBX du dossier `research`.

## Dépendances

Three.js 0.170.0 et ses modules sont livrés localement sous licence MIT (`dist/vendor/LICENSE`). Les polices DM Sans et DM Serif Display sont également embarquées localement. Aucune analyse d’audience, formulaire ou collecte de données.

## Vie du quartier

Quatre rangées de quatre pneus, Kawasaki agrandie de 22 %, chaussée de 11,5 unités, voitures de passage agrandies de 35 % et fleurs ivoire dispersées sur les faces des buissons. Le coin café comprend une tasse creuse de café au lait, un dessous de tasse en mailles de crochet et une machine expresso. Le ventilateur possède un rotor séparé ; les phares escamotables conservent les pièces originales de la Mazda.

`refine_exterior_life.py`, `refine_coffee_fan.py`, `refine_headlights.py` préparent les éléments natifs ; `update_life.py` applique ces changements à la scène existante. `dist/neighborhood-life.js` anime les oiseaux entre des perchoirs, le chat, le hérisson et deux voitures de passage. Les animaux et les véhicules sont créés dans Three.js, hors du fichier Blender. Le bouton Ⅱ suspend les animations d’ambiance ; elles sont aussi suspendues pendant les fiches, hors de l’onglet actif et par défaut si le système demande de réduire les mouvements.

Les phares s’ouvrent à 40°. La maison et la boîte aux lettres portent le numéro 06 ; deux plantes à feuilles courbées accueillent l’entrée. Le ventilateur est placé à gauche du rangement des pneus et orienté vers le bureau. `refine_layout_details.py` conserve ces ajustements ; `update_details.py` les applique à la scène existante. Les étiquettes des fluides distinguent SP98, huile moteur, refroidissement, lave-glace, huile de boîte et nettoyant freins ; une petite disqueuse complète les outils.

Le mode nuit applique un thème anthracite à toute l’interface, allume les feux des véhicules et maintient les phares de la Mazda ouverts. Deux projecteurs éclairent le sol devant la Mazda. Le mode jour restaure les couleurs et le cycle occasionnel des phares.

Le toit de la maison est couvert de tuiles rouge brique. La haie latérale suit désormais l’arbre et rejoint la haie du fond. La nuit ajoute un ciel étoilé discret, les fenêtres et le lampadaire allumés, et les feux de la moto.

Après un export Blender, lancer `node scripts/split-scene.mjs` : le modèle devient `garage.gltf` et des buffers binaires de moins de 12 Mio, sans modification de géométrie ni de matériaux. Le site charge ce format pour rester compatible avec la taille des fichiers statiques. Pour un export fiable, `export_presentation.py` exporte le native dans un processus séparé ; ajouter `-- --render-only` pour le rendu de secours.

## Village et détails mécaniques

Neuf bâtiments entourent désormais la propriété : six maisons en arrière-plan, deux bâtiments à gauche dont une boulangerie avec terrasse, et une maison basse à droite. Des rues, trottoirs, passages piétons, lampadaires et jardins relient le quartier. « Le village » offre une vue plus large ; les fenêtres et lampadaires s’allument en mode nuit.

`blender/village.py` regroupe les bâtiments par matériau ; `village_streets.py` prolonge la rue et crée les raccordements. Exécuter `update_village.py`, puis `export_presentation.py` dans un nouveau processus Blender, et enfin `node scripts/split-scene.mjs`. `export_presentation.py -- --render-only` actualise le rendu de secours dans un troisième processus.

`refine_bike_palette.py` reconstitue les zones de peinture par surfaces continues de la géométrie fournie : carénages et réservoir verts, selles et pneus noirs, mécanique et jantes grises. L’OBJ fourni ne contient ni UV ni matériaux ; cette répartition est une reconstruction visuelle, pas une livrée constructeur documentée. Les optiques et leur animation de nuit sont conservées.

`refine_jack.py` construit un cric hydraulique à roulettes détaillé. `refine_layout_details.py` oriente le ventilateur de 33° depuis sa pose d’origine, à côté du rangement à pneus.

La palette finale est appliquée par `refine_workshop_palette.py` : enduit beige rosé pour la maison principale, porte du garage bleu ciel, mobilier d’atelier bleu ciel et beige jaune clair, accents rouge foncé. Les couleurs des véhicules et des pièces métalliques sont conservées. `update_colors.py` actualise uniquement ces matières sur le fichier natif, à exporter ensuite dans un nouveau processus Blender.

`prepare_export_materials.py` résout les matériaux liés aux objets dans le processus d’export : cela conserve la palette avec les modificateurs Blender, sans changer le fichier natif.

## Créations graphiques

Le catalogue contient 32 projets, dont trois fiches « 2D & graphisme » : le logo MEIMOUN CAVENDISH (deux propositions et une planche d’évolution), la carte de vœux 2025 TECNIC’LAB (travail personnel hors emploi) et les supports AR Compétences (« Ton avis compte ! » et trois captures Instagram). Les onze images sont issues des fichiers fournis par Ruth ; les deux aperçus de la carte sont des recadrages de lecture, les planches d’origine sont également conservées. La contribution aux publications Instagram et LinkedIn est décrite comme un travail d’équipe ; les trois publications sont documentées par les captures fournies, sans inventer de lien ni attribuer leur réalisation complète à Ruth.

`dist/graphic-gallery.js` affiche les créations avec navigation et agrandissement dans la fiche. `projects.json` contient leurs légendes et contextes. Les images gardent leurs couleurs et proportions d’origine, y compris en mode nuit.

## Circuits PA Gy-RACE

Quatre tracés supplémentaires proviennent des fichiers Blender fournis par Ruth : Spa-Francorchamps, Le Mans, Monaco et Ricardo Tormo (nom confirmé par la référence interne du fichier RICARDO). Ils sont accessibles dans Gy-RACE → Modèles 3D, avec un sélecteur, rotation, zoom et vue du dessus. La mini-démo de course existante reste une adaptation distincte.

`blender/export_gyrace_circuits.py` évalue les modificateurs Array et Curve, conserve les proportions et centre les circuits sur 4 unités. Les sources ne possèdent pas de matériaux attribués ; les exports reçoivent un gris neutre. Les images externes de référence de dessin ne sont pas nécessaires au rendu. Les sources ne sont pas modifiées. Quatre GLB (1,94 Mo au total) et quatre aperçus PNG sont livrés dans `dist/assets`.

## Animations et travaux de cours

Le catalogue présente 32 projets. La fiche Téléphone — Vue éclatée reprend la vidéo fournie, réalisée avec Blender chez AR Compétences. Le film collectif I-Universe est servi en H.264 1080p avec audio AAC, à partir du master 4K : durée et générique conservés. La fiche Monoplace F1 présente la séquence personnelle de Ruth ; ses contributions et celles des coéquipiers sont décrites d’après le générique. Les vidéos démarrent sur action du visiteur et s’arrêtent à la fermeture de la fiche.

Deux fiches regroupent les travaux de cours : TP Blender — Animation (feux de départ, balle animée, cycle de marche) et Explorations 3D — Blender (huit modèles du deuxième semestre). Les fichiers `.blend1` sont des sauvegardes et ne deviennent pas des projets supplémentaires. MiniGolf utilise désormais le terrain du fichier Blender fourni dans son onglet 3D ; sa mini-démo reste distincte.

Les animations GLB de la balle et du personnage sont jouées par AnimationMixer, avec pause/reprise et retour au début. Le cadrage utilise leur enveloppe sur tout le cycle. Les contrôles respectent la réduction des mouvements et libèrent le lecteur à chaque changement de média. Les anciennes textures externes absentes du personnage ne sont pas inventées : les couleurs enregistrées sont conservées. La planète, la fractale et le terrain MiniGolf sans matériaux source sont présentés en gris. La composition du TP spirale reste interactive sans reprendre la caméra animée.

Validation : exports réimportés dans Blender, aperçus inspectés, 50 poses de chaque clip contrôlées avec GLTFLoader/AnimationMixer, 12 GLB autonomes et leurs textures vérifiés. Décodage vidéo/audio du film web vérifié ; les originaux sont conservés hors des fichiers publiés. Le contrôle visuel du navigateur est indisponible dans cette session.

## Accueil Ruth Suliman

L’entrée est une séquence plein écran sans défilement : le nom se remplit (1,35 s), un visuel s’ouvre depuis le centre (à 1,5 s), puis deux panneaux s’écartent (à 4,2 s, pendant 1,15 s) pour dévoiler l’expérience 3D déjà chargée derrière. Le principe de remplissage du nom et d’expansion du fond s’inspire de l’introduction de ciaokombucha.com, dont les styles et le script publics ont été examinés ; aucun logo, média ou code tiers n’est repris. La séparation en deux panneaux adapte l’ouverture à la demande de Ruth.

Le bouton Entrer accélère la séquence en finissant d’abord l’expansion du fond ; Échap quitte immédiatement. « ruth. » permet de rejouer l’entrée. Les copies des panneaux sont décoratives, inertes et dépourvues d’identifiants dupliqués. Tous les timers et panneaux sont supprimés à la fermeture. La réduction des mouvements affiche un écran statique avec entrée manuelle. L’écran est indépendant des modules 3D et conserve une sortie native si son script échoue.

La photo professionnelle est extraite du CV Ruth_Suliman_CV_2026.pdf (image I7, 353 × 386 pixels), convertie de JPEG 2000 en PNG sans changer ses pixels. Elle est affichée à droite du nom sur grand écran et au-dessus sur mobile, avec conservation du visage et des proportions. Les initiales restent un secours en cas d’erreur de chargement. Le navigateur de contrôle reste indisponible ; les contrôles de cycle de vie sont exécutés par qa/check-welcome.cjs, sans validation visuelle du navigateur.

## Visuels et années d’études

Les deux derniers visuels AR Compétences utilisent un cadrage SVG : « Lâche ton avis ! » (828 × 1035) et « Réparation de smartphones » (828 × 828), à partir de y=292 dans les captures 828 × 1792. Le masque garde seulement l’affiche, y compris dans les marges du mode agrandi. Les fichiers image originaux restent inchangés. La galerie MEIMOUN CAVENDISH présente désormais l’évolution, le monogramme puis le logo illustré (ancien ordre 3 → 2 → 1).

Les fiches d’études sont classées en tête du catalogue : Gy-RACE en 3e année, MiniGolf VR et le métavers multijoueur autour de la langue des signes en 4e année, puis le jeu d’horreur autour des phobies et de la fréquence cardiaque en 5e année. Ces précisions proviennent de Ruth. La nouvelle fiche du métavers reste descriptive : son titre officiel et ses sources ne sont pas encore identifiés ; elle n’est pas rattachée à l’archive Projet_AR_2_multi sans confirmation. Le projet annuel 5A est désormais classé dans Jeux & expériences.

## Précisions sur les projets annuels

Ruth a confirmé les trois PA réalisés en fin d’année : Gy-RACE en 3e année, en équipe de quatre, avec des bots de course et un travail sur leur difficulté ; le métavers en 4e année, réalisé à deux, avec reconnaissance de l’alphabet signé et transcription en texte pour communiquer entre un participant en VR et un autre utilisant une caméra sans casque ; le jeu d’horreur en 5e année, en équipe de quatre, utilisant une ceinture abdominale pour mesurer la fréquence cardiaque et orienter les situations de peur. Les fiches affichent les équipes et ces principes. La reconnaissance est limitée à l’alphabet signé ; aucun traducteur de langue des signes complète ni diagnostic clinique n’est revendiqué. MiniGolf VR reste un autre projet de 4e année. Les sources du métavers sont toujours à identifier.

## Palette professionnelle

professional-theme.css harmonise l’accueil et l’interface : rose pâle #F5E5E8 en fond, rouge vif #D9233B pour les actions, bleu ciel #C6E4F3 pour les surfaces secondaires, anthracite #292B33 pour les textes. La scène 3D conserve ses matériaux ; les fenêtres de projets, le parcours, les commandes et les bulles partagent les accents. Le mode nuit garde les surfaces anthracite et des textes clairs, avec les mêmes accents rouges et bleus. Aucun filtre de couleur n’est appliqué aux œuvres ni à la photo.

## Maison rose et jaune, moto rose poudré

La maison utilise un enduit rose pâle #F0D6DA, une menuiserie jaune beurre #F1DCA6, des appuis ivoire #FFF0D2 et de petits détails gris bleuté #718995 / taupe rosé #827075. La moto conserve ses régions de matériaux mais sa peinture devient rose poudré #DDA5B5. Les matériaux du toit en tuiles et du garage (bleu ciel, jaune clair et bordeaux) sont conservés.

refine_house_finish.py remplace les deux enveloppes du mur et du pignon, coplanaires entre z=7,22 et z=7,30, par un seul volume pentagonal extrudé. La façade est continue, sans superposition ni biseau horizontal. Cette étape est reprise dans les scripts de reconstruction et mise à jour. update_house_finish.py vérifie la conservation des autres géométries, des matériaux protégés et des affectations de la moto, sauvegarde la scène native et produit les rendus de contrôle. Les vues house-finish.png et bike-powder-pink.png ont été examinées. Export glTF et enveloppes des buffers validés ; vérification visuelle du navigateur toujours indisponible.

Interface palette: burgundy #7C2945, pale rose #F5E5E8, warm ivory #F3E8D6. Applied to splash, controls and project/journey panels.

House accents use burgundy #7C2945 on window reveals, canopy and metal details. CV typography: Georgia, italic first name. Intro: name 800ms, portrait reveal until 5800ms, then panels open.
