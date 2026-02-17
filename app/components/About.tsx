export default function About() {
  return (
    <section id="about" className="px-6 py-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-start">
        <div className="premium-card p-8">
          <h2 className="text-4xl mb-3">About Konaseema Foods</h2>
          <p className="opacity-80 leading-relaxed">
            We craft authentic Konaseema sweets using traditional recipes and pure ingredients.
            Every batch is prepared hygienically and packed carefully to preserve freshness and taste.
          </p>

          <div className="mt-6 space-y-2 opacity-80">
            <div>✅ Traditional recipes</div>
            <div>✅ Quality ingredients</div>
            <div>✅ Fresh packing</div>
            <div>✅ Perfect for gifting</div>
          </div>
        </div>

        <div className="premium-card p-8">
          <h3 className="text-3xl mb-3">Shipping & Freshness</h3>
          <p className="opacity-80 leading-relaxed">
            Orders are confirmed via WhatsApp. We pack sweets carefully for safe delivery.
            For best taste, store in a cool dry place and consume within the mentioned shelf life.
          </p>

          <div className="mt-6 p-5 border border-gold rounded-2xl bg-white/40">
            <div className="font-semibold mb-1">Need bulk / gift orders?</div>
            <div className="opacity-80">Message us on WhatsApp for custom combo boxes.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
