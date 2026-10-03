'use client';

import { useRef, useState } from 'react';
import { ArrowUpRight, Download, FlaskConical, Atom, Fingerprint, Flower2, Leaf, Citrus, Trees, Flame, Wind, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';

const families = [
  { name: 'Hespéridée', mood: 'Fraîche • Pétillante • Lumineuse', icon: Citrus, color: '#ae8938', text: "Pilier des Eaux de Cologne traditionnelles. Composée d’essences d’agrumes gorgées de soleil, cette famille apporte une envolée vivifiante et éclatante dès l’ouverture.", materials: 'Bergamote de Calabre, Citron d’Italie, Mandarine, Pamplemousse, Néroli.' },
  { name: 'Florale', mood: 'Romantique • Délicate • Opulente', icon: Flower2, color: '#ad7179', text: 'La plus vaste et emblématique des familles. Déclinée en soliflore épuré ou en bouquets majestueux, elle explore toute la richesse des pétales et des absolues florales.', materials: 'Rose de Mai, Jasmin Sambac, Tubéreuse, Fleur d’oranger, Iris florentin.' },
  { name: 'Fougère', mood: 'Aromatique • Virile • Sous-bois', icon: Leaf, color: '#73866a', text: 'Évoquant l’élégance intemporelle des salons de barbier et l’air humide d’une forêt, cet accord traditionnel marie fraîcheur aromatique et fond chaudement poudré.', materials: 'Lavande fine, Mousse de chêne, Coumarine (Tonka), Géranium, Vétiver.' },
  { name: 'Chyprée', mood: 'Racée • Contrastée • Sophistiquée', icon: Wind, color: '#967151', text: 'Née du mythique parfum Chypre de 1917, cette architecture crée un contraste saisissant entre la luminosité de la bergamote et la profondeur sombre et terreuse du fond.', materials: 'Bergamote, Ciste-Labdanum, Patchouli d’Indonésie, Mousse de chêne.' },
  { name: 'Boisée', mood: 'Noble • Structurée • Enveloppante', icon: Trees, color: '#6e7d61', text: 'Véritable colonne vertébrale des sillages puissants. Elle confère profondeur et stature, allant de textures sèches et fumées jusqu’à des douceurs crémeuses et balsamiques.', materials: 'Cèdre de l’Atlas, Santal de Mysore, Bois de Oud, Vétiver fumé, Gaïac.' },
  { name: 'Orientale (ambrée)', mood: 'Sensuelle • Mystique • Voluptueuse', icon: Flame, color: '#b07a43', text: 'Réputée pour son magnétisme captivant et sa tenue remarquable. Des accords liquoreux, chauds et épicés qui fusionnent avec la peau pour laisser un sillage inoubliable.', materials: 'Vanille Bourbon, Fève Tonka, Résine de Benjoin, Encens sacré, Ambre.' },
  { name: 'Cuirée', mood: 'Audacieuse • Fumée • Brute', icon: Fingerprint, color: '#796558', text: 'La plus confidentielle et subversive des familles olfactives. Elle recrée l’univers sensoriel des cuirs tannés, des vestes patinées, du tabac blond et des feux crépitants.', materials: 'Goudron de bouleau, Isobutyl quinoléine, Safran, Cuir suédé, Cade.' },
];
const chapters = [
  { id: 'distillation', number: '03', label: 'L’essence de la nature', title: 'Matières organiques & distillation', icon: FlaskConical, decorative: 'ESSENTIA', text: 'Le cœur battant de la parfumerie réside dans l’art d’extraire l’âme des éléments naturels à travers l’hydrodistillation et l’extraction par solvants volatils en laboratoire.', second: 'Dans la tiédeur des alambics en cuivre et de la verrerie de précision, la vapeur d’eau libère la quintessence des fleurs fraîches, des racines et des écorces rares pour en extraire des huiles pures d’une concentration absolue.', quote: 'La distillation transforme le végétal éphémère en une empreinte liquide éternelle.' },
  { id: 'molecules', number: '04', label: 'La palette de l’imaginaire', title: 'Notes synthétiques & molécules', icon: Atom, decorative: 'MOLECULA', text: 'La chimie fine est la force motrice de la parfumerie moderne. Elle donne vie à des accords que la nature ne peut livrer directement : notes marines iodées, muguet muet ou fruits juteux.', second: 'Des molécules légendaires telles que l’Ambroxan, l’Iso E Super ou les aldéhydes démultiplient l’aura du parfum, sa persistance et sa projection dans l’espace.', quote: 'La synthèse ne dénature pas la composition : elle déploie la palette infinie de l’imaginaire du parfumeur.' },
  { id: 'animaliques', number: '05', label: 'La signature de la peau', title: 'Notes animaliques & sensuelles', icon: Fingerprint, decorative: 'SENSUALIS', text: 'Les accords animaliques créent cette liaison charnelle intime entre le parfum et l’épiderme. Ils apportent une profondeur magnétique, un mystère instinctif et un pouvoir de fixation inégalé.', second: 'Recréés aujourd’hui avec éthique, les accords d’ambre gris, de castoréum, de muscs profonds et de bois de Oud fermenté forment la base des sillages les plus envoûtants du monde.', quote: 'Une touche animale donne à la fragrance sa pulsation de vie et son sillage inoubliable.' },
];

export default function Fragranea({ embedded = false }: { embedded?: boolean }) {
  const page = useRef<HTMLDivElement>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const Heading = embedded ? 'h2' : 'h1';
  async function download() {
    if (!page.current) return;
    setDownloadError(false);
    const stylesResponse = await fetch('/fragranea.css');
    if (!stylesResponse.ok) { setDownloadError(true); return; }
    const fragranceStyles = await stylesResponse.text();
    const content = page.current.cloneNode(true) as HTMLElement;
    content.querySelectorAll('[data-export-hide]').forEach(el => el.remove());
    content.querySelectorAll('details').forEach(el => el.setAttribute('open', ''));
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Luxe & Loom — L’art du parfum</title><style>${fragranceStyles}</style></head><body>${content.outerHTML}</body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'information.html'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  }
  return <div ref={page} id="guide-parfum" className={`fragranea ${embedded ? 'fr-embedded' : ''}`} lang="fr" dir="ltr">
    <header className="fr-guide-header">
      <div><span className="fr-eyebrow">Luxe & Loom · Le carnet Fragranea</span><Heading>L’art du parfum <em>d’exception.</em></Heading><p>Explorez les frontières olfactives entre créations confidentielles, secrets de distillation ancestrale et molécules synthétiques avant-gardistes.</p></div>
      <button onClick={() => { download().catch(() => setDownloadError(true)); }} data-export-hide className="fr-download"><Download size={16} /> Télécharger le guide</button>
    </header>
    <section id="visions" className="fr-section">
      <div className="fr-section-heading"><span className="fr-eyebrow">01 · Comprendre</span><h2>Niche ou designer ?</h2><p>Deux visions du luxe : la signature exclusive de connaisseur face aux icônes intemporelles de la haute couture.</p></div>
      <div className="fr-visions">
        <article className="fr-vision"><div className="fr-vision-top"><Flower2 size={26} strokeWidth={1.3} /><span>L’élégance iconique</span></div><h3>Parfums designer</h3><p>Conçus par de prestigieuses maisons de couture (Chanel, Givenchy, Guerlain, Burberry), ils incarnent une séduction universelle, des accords harmonieux et un sillage immédiatement reconnaissable.</p><ul><li>Reconnaissance immédiate & sillage complimenté</li><li>Équilibre maîtrisé entre matières nobles et accessibilité</li><li>Flacons joaillerie et égéries légendaires</li></ul></article>
        <article className="fr-vision"><div className="fr-vision-top"><Sparkles size={26} strokeWidth={1.3} /><span>L’audace pure</span></div><h3>Parfums de niche</h3><p>Créés en totale liberté par des maisons de haute maîtrise (Xerjoff, Initio, Parfums de Marly). Des concentrations très élevées, des matières brutes exceptionnelles et une identité réservée aux passionnés.</p><ul><li>Concentrations supérieures & tenue remarquable</li><li>Matières d’exception (Oud d’Assam, Rose de Taïf, Iris)</li><li>Tirages confidentiels & créativité sans compromis</li></ul></article>
      </div>
    </section>
    <section id="familles" className="fr-section">
      <div className="fr-section-heading"><span className="fr-eyebrow">02 · Trouver vos affinités</span><h2>Les 7 familles olfactives</h2><p>La classification de la Société Française des Parfumeurs qui régit l’architecture de la haute composition. Ouvrez une famille pour découvrir ses matières.</p></div>
      <div className="fr-family-list">{families.map((family, index) => <details className="fr-family" key={family.name}><summary><span className="fr-family-number">0{index + 1}</span><family.icon size={24} strokeWidth={1.3} /><span className="fr-family-title"><span>{family.name}</span><small>{family.mood}</small></span><span className="fr-expand" aria-hidden="true">+</span></summary><div className="fr-family-content"><p>{family.text}</p><p className="fr-materials"><strong>Matières clés</strong> {family.materials}</p></div></details>)}</div>
    </section>
    <section className="fr-section">
      <div className="fr-section-heading"><span className="fr-eyebrow">03 · Les secrets de composition</span><h2>De la matière au sillage</h2><p>Nature, science et sensualité : trois regards sur l’alchimie du parfum.</p></div>
      <div className="fr-chapter-grid">{chapters.map(chapter => <article key={chapter.id} id={chapter.id} className="fr-chapter"><chapter.icon size={30} strokeWidth={1.3} /><span className="fr-eyebrow">{chapter.label}</span><h3>{chapter.title}</h3><p>{chapter.text}</p><details><summary>En savoir plus <span aria-hidden="true">+</span></summary><p>{chapter.second}</p><blockquote>« {chapter.quote} »</blockquote></details></article>)}</div>
    </section>
    <div className="fr-guide-end"><div><span className="fr-eyebrow">Votre parfum, votre histoire</span><h2>Réinventez votre signature olfactive.</h2></div><Link href="/?category=Perfume#products">Découvrir les parfums <ArrowUpRight size={18} /></Link></div>
    {downloadError && <p data-export-hide role="alert">Le téléchargement a échoué. Veuillez réessayer.</p>}
    <div data-export-hide role="status" aria-live="polite" className={downloaded ? 'fr-toast' : 'fr-toast fr-toast-hidden'}>{downloaded && <><Check size={18} /> Document information.html téléchargé avec succès.<button onClick={() => setDownloaded(false)} aria-label="Fermer la notification">×</button></>}</div>
  </div>;
}
