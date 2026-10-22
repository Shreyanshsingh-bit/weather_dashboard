class WeatherApp{
    constructor(){
        this.form = document.querySelector('.location-form');
        this.inputArea = document.querySelector('.input-area');
        this.errMessage = document.getElementById('error_message'); // faster and more readable
        this.card_container = document.getElementById('dynamic_cards');
        this.feed_container = document.getElementById('live_feed');
        this.feed_out = document.getElementById('feed_output');
        this.feed_start = document.getElementById('start_feed');
        this.feed_stop = document.getElementById('stop_feed');
        this.modal = document.getElementById('modal');
        this.modal_title = document.getElementById('modal_title');
        this.modal_body = document.getElementById('modal_body');
        this.modal_close = document.getElementById('close_modal');
        this.modal_contents = document.getElementById('modal_contents');
        this.country_Input = document.getElementById('country-input')
        this.state_Input = document.getElementById('state-input');
        this.district_Input = document.getElementById('district-input');
        this.city_Input = document.getElementById('city-input');
        this.submitBtn = this.form.querySelector('button[type="submit"]');
        this.feedInterval = null;

        this.init();
    }
    init(){
        //binding modal
        this.closeModal = this.closeModal.bind(this);
    
        // arrow function doesnt need bind
        this.form.addEventListener('submit', this.handleFormSubmit);
        this.card_container.addEventListener('click', this.handleCardClick);
        this.feed_start.addEventListener('click', this.handleStartFeed);
        this.feed_stop.addEventListener('click', this.handleStopFeed);
        if(this.feed_stop) this.feed_stop.disabled = true; // stop button will not work until start is pressed

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
        // due to open_meteo api can hold atmost one comma
        const qualifier = state || country || district;
        const locationQuery = qualifier ? `${city}, ${qualifier}` : city;
        
        try {
            this.setLoading(true)
            const data = await this.fetchWeatherData(locationQuery);
            this.renderWeatherCard(data); 
            this.currentCity = locationQuery; // for feed
            this.form.reset(); // clean all inputs
        } catch (err) {
            this.showError(err.message || "Failed to fetch weather data.");
        } finally {
            this.setLoading(false);
        }
    };
    setLoading(isLoading){
        if(!this.submitBtn) return;
        if(isLoading) {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = `<span class="spinner"></span> Loading...`;
        }
        else {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = `Get Weather`;
        }
    }
    handleCardClick = (e) => {
        const card = e.target.closest('.weather-card');
        if(!card) return;


        if(e.target.classList.contains('details-btn')){
            const city = card.dataset.city;
            const temp = card.dataset.temp;
            this.openModal({ city, temp }); // reusable
        }
        if(e.target.classList.contains('color-btn')){
            card.style.backgroundColor = '#a2d3f9';
        }
        if(e.target.classList.contains('delete-btn')){
            card.remove();
        }
    };

    // for MODAL
    openModal(data) {
        if(!data) {
            this.showError('Data is not fetched properly.');
            return;
        }
        const timestamp = new Date().toLocaleTimeString();
        this.modal_title.textContent = data.city;
        const weatherData = `
            <div class="modal_content" data-temp="${data.temp}">
                <p class ="content"> In ${data.city}, the temperature feels like ${data.temp}°C</p>
                <p>Currently time is ${timestamp}</p>
            </div>
        `;
        this.modal_body.innerHTML = weatherData;
        this.modal.classList.remove('hidden');
    }

    closeModal() {
        if(this.modal){
            this.modal.classList.add('hidden');
        }
        document.body.style.overflow = "";
        if(this.modal_body) {
            this.modal_body.innerHTML = "";
        }
        this.handleStopFeed();
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
        const encodeQuery = encodeURIComponent(locationquery);
        const count = 1;
        const language = 'en';
        const baseURL = 'https://geocoding-api.open-meteo.com/v1/search';
        const format = 'json';
        const geoCodedUrl = `${baseURL}?name=${encodeQuery}&count=${count}&language=${language}&format=${format}`; // there is modern standard too
        const response = await fetch(geoCodedUrl);

        // HTTP VALIDATION CHECK

        if(!response.ok){
            throw new Error(`Response Status : ${response.status}`);
        }
        const result = await response.json(); // we used await bcoz it takes time to change into json, js should not break 

        if(!result.results || result.results.length === 0){ // here results contains the array return by open-meteo
            throw new Error('the location was not found');
        }
        const {latitude, longitude, name, country} = result.results[0]; // extracting info 

        // building weather forecast request

        const timezone = "auto";
        // const currTemp = "temp";
        const baseReqURL = "https://api.open-meteo.com/v1/forecast";

        const reqURL = `${baseReqURL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=${timezone}`;
        // console.log("Forecast URL:", reqURL); // used to test whether the api is fetched or not
        const reqResponse = await fetch(reqURL);

        // validating reqResponse
        if(!reqResponse.ok){
            throw new Error(`Response Status for reqResponse : ${reqResponse.status}`);
        }
        const reqResult = await reqResponse.json();
        if(!reqResult.current){ // it sends current
            throw new Error('the reqResponse is empty');
        }

        return {
            city : `${name} ${country ? `, ${country}` : ''}`,
            temp : reqResult.current.temperature_2m
        };
    }
    showError(msg){
        if(this.errMessage) this.errMessage.textContent = msg;
        else console.log(msg);
    }
    clearError(){
        if(this.errMessage) this.errMessage.textContent = '';
    }

    handleStartFeed = async(e) => {
        e.preventDefault();
        
        const city = this.city_Input.value.trim() || this.currentCity;
        if(!city){
            this.showError("Enter a city to start live feed!")
            return;
        }
        if(this.feedInterval){
            clearTimeout(this.feedInterval); // clear if there exists a timer
            this.feedInterval = null;
        }
        // handling buttons
        if (this.feed_start) this.feed_start.disabled = true;  // Block repeated clicks
        if (this.feed_stop) this.feed_stop.disabled = false;

        this.feed_out.textContent = "Connecting to live stream...";

        const updateFeed = async() => {
            try {
                const data = await this.fetchWeatherData(city);
                const timestamp = new Date().toLocaleTimeString();
                this.feed_out.innerHTML = `<strong>[${timestamp}]</strong> ${data.city} : ${data.temp}`;
            }
            catch(err){
                this.feed_out.textContent = `Feed Error : err.message`;
            }
            
            this.feedInterval = setTimeout(updateFeed, 30000);
        };
        await updateFeed();
    }
    // stop feed
    handleStopFeed = async(e) => {
        if(this.feedInterval){
            clearTimeout(this.feedInterval); // built in and use timeout for timeout, same for interval
            this.feedInterval = null;
        }
        if(this.feed_out){
            this.feed_out.innerHTML += `<span style="color : grey;">Live Stream Ended<span>`; // Appending it does not erase the result
        }
        // handling buttons
        if (this.feed_start) this.feed_start.disabled = false;
        if (this.feed_stop) this.feed_stop.disabled = true;

    }
}
document.addEventListener('DOMContentLoaded', () => {
  new WeatherApp();
});