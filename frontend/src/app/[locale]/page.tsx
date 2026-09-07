import { Hero } from "@/components/home/Hero";
import { ServiceList } from "@/components/configurator/ServiceList";

export default function ConfiguratorPage() {
  return (
    <div>
      <Hero />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <ServiceList />
      </div>
    </div>
  );
}
