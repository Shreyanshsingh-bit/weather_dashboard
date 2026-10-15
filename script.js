class WeatherApp{
    constructor(){
        this.form = document.querySelector('.location-form');
        this.inputArea = document.querySelector('.input-area');
        this.errMessage = document.getElementById('error_message'); // faster and more readable
        this.card_container = document.getElementById('dynamic_cards');
        this.feed_container = document.getElementById('live_feed');
        this.feed_op = document.getElementById('feed_output');
        this.feed_start = document.getElementById('start_feed');
        this.feed_stop = document.getElementById('stop_feed');
        this.modal = document.getElementById('modal');
        this.modal_title = document.getElementById('modal_title');
        this.modal_body = document.getElementById('modal_body');
        this.modal_close = document.getElementById('close_modal');
        this.modal_contents = document.getElementById('modal_contents');
        this.country_Input = document.getElementById('country-input')
        this.state_Input = document.getElementById('state-input')
        this.district_Input = document.getElementById('district-input')
        this.city_Input = document.getElementById('city-input')

        this.init();
    }
    init(){
        //binding modal
        this.closeModal = this.closeModal.bind(this);
        // this.handleCardClick = this.handleCardClick; // no need to bind contains arrow fn
        // arrow function doesnt need bind
        this.form.addEventListener('submit', this.handleFormSubmit);
        this.card_container.addEventListener('click', this.handleCardClick)

        // modal_close listener
        if(this.modal_close){
            this.modal_close.addEventListener('click', this.closeModal);
        }

    }
    
        // writing methods using arrow function 
    handleFormSubmit = async (e) => {
        e.preventDefault();

        this.clearError(); // clears previous error stage

        // trim all values
        const country = this.country_Input.value.trim();
        const state = this.state_Input.value.trim();
        const district = this.district_Input.value.trim();
        const city = this.city_Input.value.trim();

        if (!city) {
            this.showError("City is required.");
            return;
        }
        const locationQuery = [city, district, state, country]
            .filter(Boolean)
            .join(', ');

        try {
            const data = await this.fetchWeatherData(locationQuery);
            this.renderWeatherCard(data); // add something
            // this.city_Input.value = ''; // Reset input after success
            this.form.reset(); // clean all inputs
        } catch (err) {
            this.showError(err.message || "Failed to fetch weather data.");
        }
    };
    handleCardClick = (e) => {
        const card = e.target.closest('.weather-card');
        if(!card) return;


        if(e.target.classList.contains('details-btn')){
            const city = card.dataset.city;
            const temp = card.dataset.temp;
            this.modal_title.textContent = `${city}
                WEATHER DETAILS
                `;
            this.modal_body.textContent = `${temp}`;
            this.modal.classList.remove('hidden');
        }
        if(e.target.classList.contains('color-btn')){
            card.style.backgroundColor = '#a2d3f9';
        }
        if(e.target.classList.contains('delete-btn')){
            card.remove();
        }
    };
    closeModal() {
        if(this.modal){
            this.modal.classList.add('hidden');
        }
    }
    renderWeatherCard (data) { 
        // adding html
        const cardHTML = `
            <div class = "weather-card" data-city="${data.city}" data-temp="${data.temp}">
                <h3>${data.city}</h3>
                <p class = "temp">${data.temp} deg C</p>
                </-- Added buttons> --/>
                <button type="button" class="details-btn">View Details</button>
                <button type="button" class="color-btn">Change Color</button>
                <button type="button" class="delete-btn">Delete</button>
            </div>
        `;
        this.card_container.insertAdjacentHTML('beforeend', cardHTML); // inserts directly at the bottom of dynamic-card div
    }

    
    async fetchWeatherData(locationquery){
        
    }
    showError(msg){
        if(this.errMessage) this.errMessage.textContent = msg;
        else console.log(msg);
    }
    clearError(){
        if(this.errMessage) this.errMessage.textContent = '';
    }
}
document.addEventListener('DOMContentLoaded', () => {
  new WeatherApp();
});