<template>
  <div class="resource-filter">
    <div class="filter-row">
      <div class="form-group">
        <label for="typeFilter">资源类型筛选：</label>
        <select id="typeFilter" :value="selectedType" @input="$emit('update:selectedType', $event.target.value)">
          <option value="">全部</option>
          <option value="ppt">PPT</option>
          <option value="word">Word</option>
          <option value="pdf">PDF</option>
          <option value="ebook">电子书</option>
          <option value="video">视频</option>
          <option value="other">其他</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="yearFilter">年份筛选：</label>
        <select id="yearFilter" :value="selectedYear" @input="$emit('update:selectedYear', $event.target.value)">
          <option value="">全部年份</option>
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}年
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="monthFilter">月份筛选：</label>
        <select id="monthFilter" :value="selectedMonth" @input="$emit('update:selectedMonth', $event.target.value)" :disabled="!selectedYear">
          <option value="">全部月份</option>
          <option v-for="month in 12" :key="month" :value="month">
            {{ month }}月
          </option>
        </select>
      </div>
    </div>
    
    <div class="filter-actions">
      <button class="btn btn-secondary" @click="$emit('reset')">重置筛选</button>
      <span class="filter-result">
        共找到 {{ resultCount }} 个资源
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResourceFilter',
  props: {
    selectedType: String,
    selectedYear: String,
    selectedMonth: String,
    availableYears: Array,
    resultCount: Number
  },
  emits: [
    'update:selectedType',
    'update:selectedYear', 
    'update:selectedMonth',
    'reset'
  ]
}
</script>

<style scoped>
.resource-filter {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.filter-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.filter-row .form-group {
  flex: 1;
  min-width: 150px;
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.filter-result {
  color: #666;
  font-size: 14px;
}

.btn-secondary {
  background: #6c757d;
}

.btn-secondary:hover {
  background: #5a6268;
}
</style>