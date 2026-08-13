<script setup>
import SampleOne from './components/practices/basic/SampleOne.vue'
import SampleTwo from './components/practices/basic/SampleTwo.vue'
import VueHtml from './components/practices/basic/VueHtml.vue'
import VueHtmlXss from './components/practices/basic/VueHtmlXss.vue'
import VueText from './components/practices/basic/VueText.vue'
import VueBind from './components/practices/basic/VueBind.vue'
import VueBindClass from './components/practices/basic/VueBindClass.vue'
import VueBindShortHand from './components/practices/basic/VueBindShortHand.vue'
import VueIf from './components/practices/basic/VueIf.vue'
import VueShow from './components/practices/basic/VueShow.vue'
import VueFor from './components/practices/basic/VueFor.vue'
import VuePre from './components/practices/basic/VuePre.vue'
import VueCloak from './components/practices/basic/VueCloak.vue'
import VueOnce from './components/practices/basic/VueOnce.vue'
import VueMemo from './components/practices/basic/VueMemo.vue'
import EventBasic from './components/practices/event/EventBasic.vue'
import EventObject from './components/practices/event/EventObject.vue'
import EventModifier from './components/practices/event/EventModifier.vue'
import ModelBasic from './components/practices/basic/ModelBasic.vue'
import ModelForm from './components/practices/basic/ModelForm.vue'
import ModelModifier from './components/practices/basic/ModelModifier.vue'
import StyleScoped from './components/practices/basic/StyleScoped.vue'
import ReactiveRef from './components/practices/composition/ReactiveRef.vue'
import ReactiveReactive from './components/practices/composition/ReactiveReactive.vue'
</script>

<!-- 템플릿 : 화면에 갖다 붙임. -->
<template>
  <div class="practice-container">
    <h1>1. 학습환경구성</h1>
    <hr />
    <SampleOne />
    <SampleTwo />
    <h1>2. Vue Directive</h1>
    <hr />
    <VueHtml />
    <VueHtmlXss />
    <VueText />
    <VueBind />
    <VueBindClass />
    <VueBindStyle />
    <VueBindShortHand />
    <VueIf />
    <VueShow />
    <VueFor />
    <VuePre />
    <VueCloak />
    <VueOnce />
    <VueMemo />
    <h1>3. Vue Event Handling</h1>
    <hr />
    <EventBasic />
    <EventObject />
    <EventModifier />
    <h1>4. Vue Form Handling</h1>
    <hr />
    <ModelBasic />
    <ModelForm />
    <ModelModifier />
    <h1>5. Vue Style Handling</h1>
    <hr />
    <StyleScoped />
    <h1>6. Reactive State</h1>
    <hr />
    <ReactiveRef />
    <ReactiveReactive />
  </div>
</template>

<style>
@import '@/assets/practice.css';
</style>
