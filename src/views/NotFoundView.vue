<script setup>
// 정의되지 않은 경로(catch-all: /:pathMatch(.*)*)로 접근했을 때 보여주는 404 페이지.
</script>

<template>
  <div class="weather-page weather-neutral">
    <div class="notfound-page-body">
      <div class="notfound-icon">🧭</div>
      <h1>페이지를 찾을 수 없어요</h1>
      <p>주소를 다시 확인해주세요.</p>
      <RouterLink to="/" class="btn-back">← 홈으로 돌아가기</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.notfound-page-body {
  max-width: 480px;
  margin: 0 auto;
  padding: 120px 24px;
  text-align: center;
  color: #495057;
}

.notfound-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.notfound-page-body h1 {
  font-size: 1.4rem;
  margin: 0 0 8px;
  color: #1a252f;
}

.btn-back {
  display: inline-block;
  margin-top: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a7f4f;
  text-decoration: none;
}

.btn-back:hover {
  text-decoration: underline;
}
</style>
