define(['knockout'], function (ko) {
    ko.components.register('home-page', { require: 'components/home-page/home' });
    ko.components.register('summary-page', { require: 'components/summary-page/summary' });
    ko.components.register('word-page', { require: 'components/word-page/word' });
    ko.components.register('wordlist-page', { require: 'components/wordlist-page/wordlist' });
    ko.components.register('audio-controller', { require: 'audio-controller' });
});