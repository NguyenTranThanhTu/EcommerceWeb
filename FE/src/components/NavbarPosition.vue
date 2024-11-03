<template>
  <div id="navbar">
    <router-link to="/">Home</router-link> |
    <router-link to="/admin">Admin</router-link>

    <!-- Ô tìm kiếm -->
    <div class="search-container">
      <input
        type="text"
        placeholder="Search..."
        v-model="searchQuery"
        @keyup.enter="handleSearch"
      />
      <button @click="handleSearch">Search</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavbarPosition',
  data() {
    return {
      searchQuery: '', // Lưu trữ nội dung ô tìm kiếm
    };
  },
  methods: {
    handleSearch() {
      // Thực hiện hành động tìm kiếm
      console.log("Searching for:", this.searchQuery);
      // Bạn có thể thêm logic tìm kiếm ở đây, ví dụ như điều hướng đến trang kết quả
    },
  },
};
</script>

<style scoped>
#navbar {
  background-color: #333;
  color: white;
  padding: 15px;
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

#navbar a {
  color: white;
  font-weight: bold;
  margin: 0 10px;
  text-decoration: none;
}

.search-container {
  margin-left: auto; /* Đẩy ô tìm kiếm sang góc phải */
  display: flex;
  align-items: center;
}

.search-container input[type="text"] {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.search-container button {
  margin-left: 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #42b983;
  color: white;
  cursor: pointer;
}

.search-container button:hover {
  background-color: #36a572;
}
</style>
