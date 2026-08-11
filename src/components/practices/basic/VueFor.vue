<script setup>
import { ref } from 'vue'

const fruits = ref(['사과', '바나나', '포도', '딸기', '오렌지'])
const user = ref({
  name: '홍길동',
  age: 30,
  email: 'hong@example.com',
  role: '개발자',
})
const items = ref([
  { id: 'prod_101', name: '아이폰', price: 10 },
  { id: 'prod_102', name: '갤럭시', price: 20 },
  { id: 'prod_103', name: 'iPhone', price: 30 },
])
</script>

<template>
  <div class="practice-section">
    <h2>v-for 디렉티브 학습</h2>
    <h3>1) 배열 렌더링</h3>
    <ul>
      <li v-for="(fruit, index) in fruits" :key="index">{{ index + 1 }}번 과일: {{ fruit }}</li>
    </ul>

    <h3>2) 객체 렌더링</h3>
    <ul>
      <li v-for="(value, key, index) in user" :key="key">{{ index }}: {{ key }} : {{ value }}</li>
    </ul>

    <h3>3) 배열 내 객체 렌더링</h3>
    <ul>
      <li v-for="(item, index) in items" :key="item.id">[{{ index }}]{{ item.name }}</li>
    </ul>
  </div>
</template>
