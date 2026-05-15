
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-xl font-bold text-primary">SalleDeVente.sn</Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              La plateforme intermédiaire de confiance pour acheter et vendre des articles neufs et d'occasion à Dakar et partout au Sénégal.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Liens Utiles</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products">Parcourir les produits</Link></li>
              <li><Link href="/sell">Vendre un article</Link></li>
              <li><Link href="/faq">Questions Fréquentes</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Mentions Légales</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Propriété de <strong>Ogo&apos;o SARL</strong><br />
              Dakar, Sénégal<br />
              Reg. Commerce: SN-DKR-2024-B-XXXX<br />
              <Link href="/terms" className="underline">Conditions Générales d&apos;Utilisation</Link>
            </p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} SalleDeVente.sn par Ogo&apos;o SARL. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
