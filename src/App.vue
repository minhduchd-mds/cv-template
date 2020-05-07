<template>
  <v-app>
    <Section/>
    <Slider/>
    <Call/>
  </v-app>
</template>
<script>
// import Home from "@/components/Home";
// import AppNavigation from "@/components/AppNavigation";
import Section from "./components/Section";
import Slider from "./components/Slider";
import Call from "./components/base/Call";
export default {
  name: 'App',
  components: {
    Slider,
    Section,
    Call
  },

  data: () => ({
    //
  }),
};
</script>
