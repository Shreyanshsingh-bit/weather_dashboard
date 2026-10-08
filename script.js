class weatherApp{
    constructor(){
        this.form = document.querySelector('.location-form');
        this.inputArea = document.querySelector('.input-area');
        // this.submitBtn = document.querySelector('')
        // this.hiddenPara = document.querySelector('.error-feedback');
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

        // writing methods
        handleFormSubmit(e){};
        handleCardClick(e) {}
        closeModal() {}

    }
}
document.addEventListener('DOMContentLoaded', () => {
  new WeatherApp();
});