<template>
  <v-app>
    <Section/>
    <Slider/>
  </v-app>
</template>
<script>
// import Home from "@/components/Home";
// import AppNavigation from "@/components/AppNavigation";
import Section from "@/components/Section";
import Slider from "@/components/Slider";
export default {
  name: 'App',
  components: {
    Slider,
    Section
  },

  data: () => ({
    //
  }),
};
</script>
