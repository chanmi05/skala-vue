<script setup>
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

// 부모(WeatherHome.vue)가 가진 searchQuery를 props로 그대로 전달받는다.
// 이 컴포넌트는 자기만의 검색 상태를 따로 갖지 않는다 — "진짜 값"은 항상 부모에게 있고,
// 여기서는 그 값을 보여주고, 사용자가 바꾸면 emit으로 알리기만 한다.
defineProps({
  query: { type: String, default: '' },
})

const emit = defineEmits(['update-query'])

// 한글 조합 중인 입력값도 input 이벤트에서 그대로 꺼내 부모에게 전달한다.
// props는 읽기 전용이므로 직접 바꾸지 않고 update-query 이벤트를 사용한다.
const handleInput = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div class="search-bar">
    <div class="search-control">
      <IconField class="search-field">
        <InputIcon class="pi pi-search" />
        <InputText
          :value="query"
          placeholder="도시 이름 또는 초성(예: ㅂ → 부산)"
          fluid
          aria-label="도시 검색"
          @input="handleInput"
        />
      </IconField>
      <Button
        v-if="query"
        type="button"
        icon="pi pi-times"
        severity="secondary"
        text
        rounded
        aria-label="검색어 지우기"
        @click="emit('update-query', '')"
      />
    </div>
    <p>검색 중인 도시: <strong>{{ query || '전체' }}</strong></p>
  </div>
</template>

<style scoped>
.search-control {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}

.search-field {
  flex: 1;
}

.search-field :deep(.p-inputtext) {
  width: 100%;
  font-size: 14px;
}

.search-bar p {
  margin: 10px 0 0;
  font-size: 0.85rem;
  color: #495057;
}
</style>
