<script setup>
// 검색박스 / 필터박스 / 리스트박스가 전부 "흰 카드 + 둥근 테두리 + 제목" 모양을
// 똑같이 쓰고 있어서, 그 껍데기(디자인)만 여기로 뽑아냈다.
// 이 컴포넌트는 안에 뭐가 들어가는지 전혀 모른다 — title이라는 문자열 하나와,
// <slot />으로 "부모가 통째로 넘겨준 내용물"만 그대로 그려줄 뿐이다.
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <section class="dashboard-card">
    <div v-if="title || $slots.actions" class="dashboard-card-header">
      <h3 v-if="title">{{ title }}</h3>
      <!-- actions라는 이름이 붙은 슬롯: 제목 옆에 버튼(초기화, 정렬 등)을 꽂고 싶을 때만 사용 -->
      <slot name="actions" />
    </div>

    <!-- 이름 없는 기본 슬롯: 카드 본문 전체. 실제 내용(SearchBar, FilterBox, WeatherCard 목록 등)은
         이 컴포넌트가 아니라 이 컴포넌트를 사용하는 부모(WeatherHome.vue)의 템플릿에서 결정된다. -->
    <slot />
  </section>
</template>

<style scoped>
.dashboard-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.05);
}

.dashboard-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.dashboard-card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
}
</style>
