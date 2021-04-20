<template>
    <div class="ui-timeline-item" :class="isRotate?'rotate-180 color-' + color:'color-' + color">
        <div class="ui-timeline-item__top">{{timeDesc}}</div>
        <div class="ui-timeline-item__bottom">{{time}}</div>
        <div class="ui-timeline-item__pic" :class="{'arrow':isArrow}"></div>
    </div>
</template>
<script>
export default {
    name: "time-line",
    props: ["color", "isRotate", "timeDesc", "time","isArrow"],
    data() {
        return {};
    }
};
</script>
<style lang="scss" scoped>
$green-color: #48b362;
$yellow-color: #9ea763;
$blue-color: #419efe;
.ui-timeline-item {
    width: 240px;
    height: 220px;
    position: relative;
    display: inline-block;
    margin-top: 20px;
    &::before {
        position: absolute;
        width: 240px;
        height: 111px;
        top: 0;
        left: 0;
        content: "";
        display: block;
    }
    &::after {
        position: absolute;
        display: block;
        content: "";
        height: 160px;
        left: 0;
        bottom: 0;

        width: 121px;
    }
    &__top {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
    }
    &__bottom {
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
    }
    &__pic {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 10px;
        height: 10px;
        transform: translate(-50%, -50%);
        border-radius: 10px;
        &::before {
            position: absolute;
            width: 0;
            height: 0;
            display: block;
            content: "";
            top: -55px;
            left: 0px;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
        }
        &.arrow {
            &::after {
                position: absolute;
                right: -135px;
                top: 50%;
                content: "";
                display: block;
                border-top: 10px solid transparent;
                border-bottom: 10px solid transparent;
                transform: translateY(-50%);
            }
        }
    }
    &.color-green {
        &::before {
            border-bottom: 2px solid $green-color;
        }
        &::after {
            border-right: 2px dashed $green-color;
        }
        .ui-timeline-item__pic {
            background: $green-color;
            &::before {
                border-bottom: 20px solid $green-color;
            }
            &.arrow {
                &::after {
                    border-left: 20px solid $green-color;
                }
            }
        }
        
    }
    &.color-yellow {
        &::before {
            border-bottom: 2px solid $yellow-color;
        }
        &::after {
            border-right: 2px dashed $yellow-color;
        }
        .ui-timeline-item__pic {
            background: $yellow-color;
            &::before {
                border-bottom: 20px solid $yellow-color;
            }
            &.arrow {
                &::after {
                    border-left: 20px solid $yellow-color;
                }
            }
        }
    }
    &.color-blue {
        &::before {
            border-bottom: 2px solid $blue-color;
        }
        &::after {
            border-right: 2px dashed $blue-color;
        }
        .ui-timeline-item__pic {
            background: $blue-color;
            &::before {
                border-bottom: 20px solid $blue-color;
            }
            &.arrow {
                &::after {
                    border-left: 20px solid $blue-color;
                }
            }
        }
    }
    &.rotate-180 {
        transform: rotate(180deg);
        .ui-timeline-item__top,
        .ui-timeline-item__bottom {
            transform: translateX(-50%) rotate(180deg);
        }
        .ui-timeline-item__pic{
            &.arrow{
                &::after{
                    border-left: 20px solid #48b362;
                    transform: translate(-260px,-10px) rotate(180deg);
                }
            }
        }
    }
}
</style>