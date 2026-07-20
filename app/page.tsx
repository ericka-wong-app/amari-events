import IntroReveal from "./components/IntroReveal";
import Hero from "./components/Hero";
import Details from "./components/Details";
import Godparents from "./components/Godparents";
import Directions from "./components/Directions";
import RsvpCta from "./components/RsvpCta";
import GiftRegistry from "./components/GiftRegistry";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center">
      <IntroReveal />
      <Hero />
      <Details />
      <Godparents />
      <Directions />
      <RsvpCta />
      <GiftRegistry />
      <Footer />
    </main>
  );
}
