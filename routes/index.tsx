import { Head } from "fresh/runtime";
import { define } from "../utils.ts";

export default define.page(function Home() {
  return (
    <div class="page">
      <Head>
        <title>Homeyko</title>
      </Head>
      <main>
        <h1>Homeyko</h1>
        <p>Strona w przygotowaniu.</p>
      </main>
    </div>
  );
});
