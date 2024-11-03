<template>
  <div class="card w-100 h-100" style="margin-top: 10px">
    <div class="embed-responsive embed-responsive-16by9">
      <img
        class="card-img-top embed-responsive-item"
        :src="viewcategory.imageUrl"
        alt="Card image cap"
      />
    </div>
    <div class="card-body">
      <h5 class="card-title">{{ viewcategory.categoryName }}</h5>
      <p class="card-text">
        {{ viewcategory.description }}
      </p>
      <RouterLink :to="{name: 'EditCategory', params: {id: category.id}}">
        <button class="btn btn-primary">Edit </button>
      </RouterLink>
        
     
    </div>
  </div>
</template>

<script>
export default {
  name: "CategoryBox",
  props: ["viewcategory"],
  methods: {},
};
</script>

<style scoped>
.card-img-top {
    object-fit: cover;
}
</style>
