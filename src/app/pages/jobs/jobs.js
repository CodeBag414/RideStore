(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('JobsController', JobsController);

  JobsController.$inject = ['api', 'head', '$stateParams', '$state', '$http'];

  function JobsController(api, head, $stateParams, $state, $http) {

    var vm = this;
    vm.head = head;
    var callback = 'JSON_CALLBACK';
    vm.applyLabel = 'Apply';

    vm.sendEmail = function() {
      vm.applyLabel = 'Thanks!';

      var message = vm.contact.message;
      var subject = 'Tech-work ansökan från ' + vm.contact.name;
      api.sendEmail({
        'email_id' : 'work',
        'from_email' : vm.contact.email,
        'subject' : subject,
        'message' : message
      });
    };

    getWorkEntry($stateParams.work);

    vm.personProfile = [
      'Du har ett starkt driv och vill hela tiden utvecklas.',
      'Du är en doer som sätter skit i rullning.',
      'Du är klar med att det enda konstanta är förändring.',
      'Du kommer med egna idéer och formar själv din roll ihop med oss.',
      'Det viktigaste är att du inser hur värdefull du kan bli för ridestore'
    ];

    function getWorkEntry(job) {
      /* jscs:disable maximumLineLength */
      /* jshint -W101 */
      //TODO, make api call to cms.
      if (job === 'js-utvecklare') {
        vm.title = 'GRYM JS-UTVECKLARE';
        vm.subTitle = 'Vi söker en grym javascript utvecklare med erfaranhet av angular och/eller react.';
        vm.intro = 'Just nu bygger vi om hela sajten i angular och vi kikar även på react native för våra appar. Det började med att vi byggde vår stylecreator i angular och insåg då hur mycket bättre kundupplevelsen blev. Arbetet görs från grunden och det är bland annat här vi behöver hjälp. Så snart vi fått sajten att lira fint i angular är det dags att förverkliga nya idéer. ';
        vm.skills = [
          'Angular och/eller React',
          'Sass',
          'RESTful api:er, speca och använda',
          'Gulp/Grunt',
          '+ Med erfaranhet av node.js'
        ];
        vm.showLocation = true;
        vm.externalApply = false;
      } else if (job === 'backend-utvecklare') {
        vm.title = 'SKÖN PHP-UTVECKLARE';
        vm.subTitle = 'Vi söker en duktig php utvecklare som vill vara med och ta Ridestore till nästa nivå.';
        vm.intro = 'Vi söker dig som har PHP, ramverk, git, webben och problemlösning i blodet. Vi står inför en hel del tekniska utmaningar på backend sidan då vi just nu håller på att byga nya api:er för våra appar och nya website som byggs i angular (du är inne på den just nu)';
        vm.skills = [
          'PHP',
          'Ramverk',
          'MySQL',
          'RESTful api:er',
          'Git'
        ];
        vm.showLocation = true;
        vm.externalApply = false;
      }
      else if (job === 'customerexperience') {
        vm.title = 'CUSTOMER EXPERIENCE NINJA';
        vm.subTitle = 'Vi letar efter nästa medarbetade till Ridestore Crew! Har du skillsen att hjälpa våra finska kunder till en WOW-känsla?';
        vm.intro = 'I vårt kundteam jobbar vi med all kommunikation med våra kunder och fans, och din uppgift blir att styra skutan med våra finska kunder. Med placeringen anywhere in the world menar vi verlkigen just det, du kan sköta jobbet via mobilen eller datorn där du befinner dig. Och samtidigt vara en del av vår gemenskap inom Ridestore Crew, hur låter det?';
        vm.skills = [
          'Finska och svenska flytande',
          'Peppad',
          'Flexibel',
          'Målinriktad',
          '+ för actionsport intresse'
        ];
        vm.showLocation = false;
        vm.externalApply = true;
        vm.applyUrl = 'http://www.surveygizmo.com/s3/2804630/customer-experience-finland';
      }
      else {
        $state.go('404');
      }
      /* jscs:enable maximumLineLength */
      /* jshint +W101 */
    }

  }

})();
