<template>
  <div class="home">
    <div class="splash-container">
      <div class="splash">
        <h1>Splendid Food</h1>
      </div>
    </div>

    <main class="wrapper">
      <h2>Recommended</h2>

      <div class="recommended">
        <div class="card">
          <div class="card-title">Carrots</div>
          <div class="card-body">
            <i class="icofont-10x icofont-carrot"></i>
            <form>
              <div class="row">
                <div class="cell">
                  <label>Type:</label>
                </div>
                <div class="cell">
                  <em>Vegetable</em>
                </div>
              </div>
              <div class="row">
                <div class="cell">
                  <label>Price:</label>
                </div>
                <div class="cell">$4.82</div>
              </div>
              <div class="row">
                <div class="cell">
                  <label>Quantity:</label>
                </div>
                <div class="cell">
                  <input type="number" v-model.number="inventory.carrots" />
                </div>
              </div>
            </form>
          </div>
          <div class="card-footer">
            <button @click="addToCart('carrots')" class="btn btn-light">
              Add to cart
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Pineapples</div>
          <div class="card-body">
            <i class="icofont-10x icofont-pineapple"></i>
            <form>
              <div class="row">
                <div class="cell">
                  <label>Type:</label>
                </div>
                <div class="cell">
                  <em>Fruit</em>
                </div>
              </div>
              <div class="row">
                <div class="cell">
                  <label>Price:</label>
                </div>
                <div class="cell">$1.62</div>
              </div>
              <div class="row">
                <div class="cell">
                  <label>Quantity:</label>
                </div>
                <div class="cell">
                  <input type="number" v-model="inventory.pineapples" />
                </div>
              </div>
            </form>
          </div>
          <div class="card-footer">
            <button class="btn btn-light">Add to cart</button>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Cherries</div>
          <div class="card-body">
            <i class="icofont-10x icofont-cherry"></i>
            <form>
              <div class="row">
                <div class="cell">
                  <label>Type:</label>
                </div>
                <div class="cell">
                  <em>Fruit</em>
                </div>
              </div>
              <div class="row">
                <div class="cell">
                  <label>Price:</label>
                </div>
                <div class="cell">$1.04</div>
              </div>
              <div class="row">
                <div class="cell">
                  <label>Quantity:</label>
                </div>
                <div class="cell">
                  <input type="number" v-model="inventory.cherries" />
                </div>
              </div>
            </form>
          </div>
          <div class="card-footer">
            <button class="btn btn-light">Add to cart</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import food from '../food.json';

export default {
  name: 'Home',
  data() {
    return {
      inventory: food,
    };
  },
  components: {},
};
</script>
