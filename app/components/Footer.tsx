export default function Footer() {
  return (
    <footer id="contact" className="px-6 pt-16 pb-10 border-t border-gold bg-cream">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        <div>
          <div className="brand-logo text-3xl mb-3">Konaseema Specials</div>
          <p className="opacity-80">
            Authentic traditional sweets & snacks. Freshly prepared and packed with care.
          </p>
        </div>

        <div>
          <h4 className="text-xl mb-3">Contact</h4>
          <div className="opacity-80 space-y-2">
            <div>Email: <a className="underline" href="mailto:konaseemaspecials@gmail.com">konaseemaspecials@gmail.com</a></div>
            <div>WhatsApp: <a className="underline" href="https://wa.me/916305419750" target="_blank">+91 6305419750</a></div>
            <div>Instagram: <a className="underline" href="#" target="_blank">@konaseema_specials</a></div>
          </div>
        </div>

        <div>
          <h4 className="text-xl mb-3">Policies</h4>
          <ul className="opacity-80 space-y-2">
            <li><a className="underline" href="#">Return & Refund Policy</a></li>
            <li><a className="underline" href="#">Delivery Policy</a></li>
            <li><a className="underline" href="#">Privacy Policy</a></li>
            <li><a className="underline" href="#">Terms & Conditions</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl mb-3">Quick Order</h4>
          <p className="opacity-80 mb-4">Order instantly via WhatsApp.</p>
          <a className="btn-primary inline-block bg-green-700 hover:bg-green-800" href="https://wa.me/916305419750" target="_blank">
            WhatsApp Now
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-gold opacity-70 text-sm flex flex-wrap gap-3 justify-between">
        <span>© {new Date().getFullYear()} Konaseema Specials. All rights reserved.</span>
        <span>Made with love in Konaseema ❤️ </span>
      </div>
    </footer>
  );
}
