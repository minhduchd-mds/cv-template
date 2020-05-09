<template>
  <v-app>
    <Section/>
    <AppNavigation/>
  </v-app>
</template>
<script>
// import Home from "@/components/Home";
// import AppNavigation from "@/components/AppNavigation";
import Section from "./components/Section";
// import Slider from "./components/Slider";
// import Call from "./components/base/Call";
// import DownloadPDF from "./components/base/DownloadPDF";
import AppNavigation from "./components/AppNavigation";
export default {
  name: 'App',
  components: {
    AppNavigation,
    Section
  },

  data: () => ({
    //
  }),
};
</script>
