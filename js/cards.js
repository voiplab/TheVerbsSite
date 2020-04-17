// noinspection JSUnusedGlobalSymbols
window.cards = {
    onActionDirectionRight: function () {
        cards.onActionDirection(cards.rightExtrimePosition, true);
    },
    onActionDirectionLeft: function () {
        cards.onActionDirection(cards.leftExtrimePosition, true);
    },    
    onActionDirection: function (direction, force) {
        force = force || false;        
        if (!cards.allowedSwipes.includes(direction.name)&&!force){
            return;
        }
        cards.allowTouch = false;
        cards.allowedSwipes = [];
        direction.obj.style.zIndex = "8";
        cards.transformUi(1, 0, 0, 0.8, false, direction.obj, true);
        setTimeout(function () {
            cards.swipeCard(direction);
        }, 300);
    },    
    moveOverlaysToBack: function () {
        for (let i = 0; i < cards.overlays.children.length; i++) {
            cards.transformUi(1, 0, 0, 0, false, cards.overlays.children[i],
                false);
        }
        setTimeout(() => {
            for (let i = 0; i < cards.overlays.children.length; i++) {
                cards.overlays.children[i].style.zIndex = "0";
            }
        }, 200);
    },

    moveOverlaysToTop: function () {
        for (let i = 0; i < cards.overlays.children.length; i++) {
            cards.overlays.children[i].style.zIndex = "8";
        }
    },

    backToMiddle: function () {
        cards.moveOverlaysToBack();
        cards.transformUi(1, 0, 0, 1, true, cards.firstCard);
    },
    swipeToExtremePosition: function (extremePosition) {
        cards.transformUi(1, extremePosition.posX, extremePosition.posY, 0,
            true,
            cards.firstCard);
        cards.transformUi(1, extremePosition.posX, extremePosition.posY, 0,
            true, extremePosition.obj);
        cards.changeBackground();
        cards.resetCards(1);
    },
    swipeCard: function (extremePosition) {
        cards.allowTouch = false;
        cards.allowedSwipes = [];

        switch (extremePosition.name) {
            case 'Top':
                break;
            case 'Left':                                
            case "Right":
                cards.swipeToExtremePosition(extremePosition);
                break;
        }

        setTimeout(() => {
            cards.transformUi(1, 0, 0, 0, true, cards.firstCard, true);
            userScope.nextStepActionByDirection(cards.firstCard.id, extremePosition.name);
        }, 300)
    },
    changeBackground: function (number) {
        let currentColorNumber = -1;
        document.body.classList.forEach(function (value) {
            if (value.startsWith('background-')) {
                currentColorNumber = Number(value.split('-')[1]);
                document.body.classList.remove(value);
            }
        });
        number = number || (currentColorNumber <= 6) ?
            currentColorNumber + 1 :
            0;
        document.body.classList.add("background-" + number);
    },
    resetCards: function (skip) {
        skip = skip || 0;
        for (let i = cards.stackedCards.childElementCount - 1; i >=
        skip; i--) {
            let card = cards.stackedCards.children[i];
            const n = i - skip;
            const elTrans = (cards.elementsMargin * n) * -1;
            const elScale = 1 - (cards.scaleMultiplier * n);
            const elOpacity = 1 -
                ((1 / cards.stackedCards.childElementCount) * n);
            const zIndex = 7 - i;
            card.style.zIndex = zIndex.toString();
            const noTransition = ((cards.stackedCards.childElementCount === 1 || i !== cards.stackedCards.childElementCount - 1) && skip === 0);
            if (!noTransition) {
                setTimeout(
                    () => cards.transformUi(elScale, 0, elTrans, elOpacity, false, card, noTransition), 1);
            } else {
                cards.transformUi(elScale, 0, elTrans, elOpacity, false, card, noTransition);
            }
        }
    },
    //Add translate X and Y to active card for each frame.
    transformUi: function (
        scale, moveX, moveY, opacity, doRotate, element, noTransition) {
        const transition = !noTransition || false;
        if (transition) {
            cards.enableObjectTransition(element);
        } else {
            cards.disableObjectTransition(element);
        }
        requestAnimationFrame(function () {
            // Function to generate rotate value 
            /**
             * @return {number}
             */
            function RotateRegulator(value) {
                if (value / 10 > 15) {
                    return 15;
                } else if (value / 10 < -15) {
                    return -15;
                }
                return value / 10;
            }

            const rotateElement = doRotate ? RotateRegulator(moveX) : 0;
            element.style.transform = 'scale(' + scale + ') translateX(' +
                moveX + 'px) translateY(' + moveY +
                'px) translateZ(0px) rotate(' + rotateElement + 'deg)';
            element.style.opacity = opacity;
        });
    }
    ,
    disableObjectTransition: function (obj) {
        obj.classList.add('no-transition');
    }
    ,
    enableObjectTransition: function (obj) {
        obj.classList.remove('no-transition');
    },
    init: function (firstRender, allowedSwipes) {
        let rightOpacity;
        let leftOpacity;
        let topOpacity;
        let startTime;
        let startX;
        let startY;
        let currentY;
        let currentX;
        let translateX;
        let translateY;
        let touchingElement = false;

        function initVariables(allowedSwipes) {
            cards.allowTouch = true;
            cards.allowedSwipes = allowedSwipes;
            cards.scaleMultiplier = 0.08;
            cards.elementsMargin = 15;
            cards.velocity = 0.3;
            cards.extrimePosition = 1000;

            cards.cardsBlock = document.getElementById('stacked-cards-block');
            cards.buttonLeft = document.querySelector('.left-action');
            cards.buttonTop = document.querySelector('.top-action');
            cards.buttonRight = document.querySelector('.right-action');
            cards.stackedCards = cards.cardsBlock.querySelector(
                '.stackedcards-container');
            cards.firstCard = cards.stackedCards.children[0];
            cards.lastCard = cards.stackedCards.children[cards.stackedCards.children.length -
            1];
            cards.overlays = cards.cardsBlock.querySelector(
                '.stackedcards-overlays');
            cards.leftOverlay = cards.overlays.querySelector('.left');
            cards.rightOverlay = cards.overlays.querySelector('.right');
            cards.topOverlay = cards.overlays.querySelector('.top');
            cards.leftExtrimePosition = createExtremePosition('Left',
                -cards.extrimePosition, 0, cards.leftOverlay);
            cards.rightExtrimePosition = createExtremePosition('Right',
                cards.extrimePosition, 0, cards.rightOverlay);
            cards.topExtrimePosition = createExtremePosition('Top', 0,
                -cards.extrimePosition, cards.topOverlay);
            cards.stackedCards.style.marginBottom = cards.elementsMargin *
                (cards.stackedCards.childElementCount - 1) + 'px';
        }

        //Move the overlays to initial position.
        function resetDefaultPositions() {
            cards.moveOverlaysToBack();

            if (cards.stackedCards.childElementCount>1 && cards.lastCard) {
                cards.transformUi(0, cards.topExtrimePosition.posX,
                    cards.topExtrimePosition.posY, 0, false, cards.lastCard,
                    true);
            }
        }

        function setOverlayOpacity() {
            topOpacity = 0;
            rightOpacity = 0;
            leftOpacity = 0;

            const YOpacity = Math.abs(
                (((translateY + (cards.cardsBlock.offsetHeight / 4)) /
                    (cards.cardsBlock.offsetHeight / 5))));
            const XOpacity = Math.abs(
                translateX / (cards.cardsBlock.offsetWidth / 2));
            let avgOpacity = Math.min((YOpacity + XOpacity) / 2, 1);

            if (avgOpacity === 0) {
                return;
            }

            if (translateY < -(cards.cardsBlock.offsetHeight / 4) &&
                translateX > ((cards.stackedCards.offsetWidth / 2) * -1) &&
                translateX < ((cards.stackedCards.offsetWidth / 2))) {
                topOpacity = avgOpacity;
                return;
            }

            if (translateX > 0) {
                rightOpacity = avgOpacity;
                return;
            }

            leftOpacity = avgOpacity;
        }

        function gestureStart(evt) {
            if (!cards.allowTouch){
                return;
            }
            touchingElement = true;
            cards.moveOverlaysToTop();
            startTime = new Date().getTime();

            currentX = startX = evt.changedTouches[0].clientX;
            currentY = startY = evt.changedTouches[0].clientY;
        }

        function gestureMove(evt) {
            if (!cards.allowTouch){
                return;
            }
            
            evt.preventDefault();
            
            currentX = evt.changedTouches[0].pageX;
            currentY = evt.changedTouches[0].pageY;

            translateX = currentX - startX;
            translateY = currentY - startY;

            setOverlayOpacity();

            cards.transformUi(1, translateX, translateY, 1, true, cards.firstCard,
                true);
            cards.transformUi(1, translateX, translateY, topOpacity, true,
                cards.topOverlay, true);
            cards.transformUi(1, translateX, translateY, leftOpacity, true,
                cards.leftOverlay, true);
            cards.transformUi(1, translateX, translateY, rightOpacity, true,
                cards.rightOverlay, true);
        }

        function gestureEnd() {
            cards.moveOverlaysToBack();            
            if (!touchingElement || !cards.allowTouch) {
                return;
            }

            touchingElement = false;
            const timeTaken = new Date().getTime() - startTime;
            translateX = currentX - startX;
            translateY = currentY - startY;
            setOverlayOpacity();

            if (cards.allowedSwipes.includes("Top") && (translateY < ((cards.cardsBlock.offsetHeight / 3) * -1) && translateX > ((cards.stackedCards.offsetWidth / 2) * -1) && translateX < (cards.stackedCards.offsetWidth / 2))) {  //is Top?
                if (translateY < ((cards.cardsBlock.offsetHeight / 3) * -1) ||
                    (Math.abs(translateY) / timeTaken > cards.velocity)) {
                    cards.swipeCard(cards.topExtrimePosition);
                } else {
                    cards.backToMiddle();
                }
            } else {
                if (translateX < 0) {
                    if (cards.allowedSwipes.includes("Left") && (translateX < ((cards.stackedCards.offsetWidth / 2) * -1) || (Math.abs(translateX) / timeTaken > cards.velocity))) {
                        cards.swipeCard(cards.leftExtrimePosition);
                    } else {
                        cards.backToMiddle();
                    }
                } else if (translateX > 0) {
                    if (cards.allowedSwipes.includes("Right") && (translateX > (cards.stackedCards.offsetWidth / 2) && (Math.abs(translateX) / timeTaken > cards.velocity))) {
                        cards.swipeCard(cards.rightExtrimePosition);
                    } else {
                        cards.backToMiddle();
                    }
                }
            }
        }

        function createExtremePosition(name, posX, posY, obj) {
            let cardSwipe = Object.create(null);

            cardSwipe.name = name;
            cardSwipe.posX = posX;
            cardSwipe.posY = posY;
            cardSwipe.obj = obj;

            return cardSwipe;
        }

        //Action to update all elements on the DOM for each stacked card.
        function updateUi() {
            resetDefaultPositions();
            // todo: maybe need to hide buttons if disable state 
            cards.resetCards();
        }

        initVariables(allowedSwipes);

        //todo: avoid page generation from js, do it by blazor please 
        if (!firstRender && cards.stackedCards.children.length === 0) {
            return;
        }

        if (!firstRender && cards.stackedCards.children.length > 0) {
            updateUi();
        }

        if (firstRender) {
            cards.cardsBlock.addEventListener('touchstart', gestureStart,
                false);
            cards.cardsBlock.addEventListener('touchmove', gestureMove,
                false);
            cards.cardsBlock.addEventListener('touchend', gestureEnd,
                false);
            cards.buttonLeft.addEventListener('click', _ => {
                cards.onActionDirection(cards.leftExtrimePosition)
            }, false);
            cards.buttonTop.addEventListener('click', _ => {
                cards.onActionDirection(cards.topExtrimePosition)
            }, false);
            cards.buttonRight.addEventListener('click', _ => {
                cards.onActionDirection(cards.rightExtrimePosition)
            }, false);
        }
    }
};