<template>
    <div id='box' class="menu-hide">
        <div class="mainbox ptb10">
            <!-- 坐席号 -->
            <section v-if="!projectManger||oa_seat_id" class="service_section mt10 flex align-center">
                <h3 class="block mr10">当前坐席号:</h3>
                <!-- {{projectManger}} -->
                <div v-if="oa_seat_id">{{oa_seat_id}}</div>
                <el-button v-else type="primary" size="small" @click="goBindSeat">去绑定</el-button>
            </section>
            <!-- 接听概况 -->
            <section class="service_section mt10">
                <h2>接听概况</h2>
                <div class="service_infoBox">
                    <div class="info_lists flex-between">
                        <div class="list_item ">
                            <span class="item_key">来电:</span>
                            <span class="item_val">{{robotInfo.mobile}}</span>
                        </div>
                        <div class="list_item ">
                            <span class="item_key">机器人编号:</span>
                            <span class="item_val">{{robotInfo.number}}</span>
                        </div>
                        <div class="list_item ">
                            <div class="flex align-center">
                                停车场: <my-select-station v-model="selectStation" @select="stationChange" size="small" class="cell widthX150 ml10 " placeholder="停车场"></my-select-station>
                            </div>

                        </div>
                        <div class="list_item ">
                            <div class="flex align-center">
                                出入口:
                                <el-select size="small" class="cell widthX150 ml10 " v-model="roadId" @change="roadChange" filterable clearable placeholder="出入口">
                                    <el-option v-for="(item,index) in roadList" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </div>

                        </div>
                        <div class="list_item ">
                            <el-button size="small" type="primary" @click='setprojectManger'>查询</el-button>
                        </div>
                    </div>
                </div>
            </section>
            <!-- 停车场信息 -->
            <section class="service_section mt10">
                <h2>停车场信息</h2>
                <div class="service_infoBox">
                    <div class="info_lists">
                        <div class="list_item widthP100">
                            <span class="item_key">停车场:</span>
                            <span class="item_val">{{robotInfo.station_name}}</span>
                        </div>
                        <div class="list_item widthP25">
                            <span class="item_key">负责人:</span>
                            <span class="item_val">{{robotInfo.admin}}</span>
                        </div>
                        <div class="list_item widthP25">
                            <span class="item_key">负责人电话:</span>
                            <span class="item_val">{{robotInfo.admin_mobile}}</span>
                        </div>
                    </div>
                </div>
            </section>
            <!-- 现场情况 -->
            <section class="service_section mt10">
                <h2>现场情况</h2>
                <div class="service_infoBox">
                    <div class="img_lists">
                        <div class="list_item widthP33">
                            <div class="item_header">道闸口图片</div>
                            <div class="item_body">
                                <img :src="current_device_image" alt="" />
                            </div>
                        </div>
                        <div class="list_item widthP33">
                            <div :class="['item_header', {'bg-none': !camera_switch}]">
                                <span>环境摄像头</span>
                                <el-switch v-model="camera_switch" :disabled='can_input_plate' active-color="#24e06c" inactive-color="#bbbbbb" @change='openCamera'> </el-switch>
                            </div>
                            <div class="item_body" ref='envCamera'>
                            </div>
                        </div>
                        <div class="list_item widthP33">
                            <div class="item_header">机器人显示屏</div>
                            <div class="item_body">
                                <img :src="robotScrrenImg" alt="" />
                            </div>
                        </div>
                    </div>
                    <div class="plate_change" v-if='direction==="out"&&carData.reason=="noplate"'>
                        <div class="label">无牌车请输入手机号</div>
                        <div class="input">
                            <el-input v-model.trim="true_phone" size="small" placeholder="请输入手机号"></el-input>
                        </div>
                        <div class="btn">
                            <el-button size="small" type="primary" @click='refreshPhone'>查询</el-button>
                        </div>
                    </div>
                    <div class="plate_change" v-else>
                        <div class="label">车牌号输入或更正</div>
                        <div class="input">
                            <el-input v-model.trim="true_plate" :disabled='can_input_plate' size="small" placeholder="请输入车牌号"></el-input>
                        </div>
                        <div class="btn">
                            <el-button size="small" type="primary" :disabled='can_input_plate' @click='refreshPlate'>查询</el-button>
                        </div>
                    </div>
                </div>
            </section>
            <!-- 当前车辆信息 -->
            <section class="service_section mt10">
                <h2>当前车辆信息</h2>
                <div class="service_infoBox">
                    <div class="info_lists">
                        <div class="list_item widthP25">
                            <span class="item_key">车牌号:</span>
                            <span class="item_val">{{carData.plate}}</span>
                        </div>
                        <div class="list_item widthP25">
                            <span class="item_key">是否月卡:</span>
                            <span class="item_val">{{cfg.isMonth[carData.isMonth]}}</span>
                        </div>
                        <template v-if='carData.isMonth==="Y"'>
                            <div class="list_item widthP25">
                                <span class="item_key">月卡状态:</span>
                                <span class="item_val">{{cfg.status[carData.status]}}</span>
                            </div>
                            <div class="list_item widthP50">
                                <span class="item_key">月卡有效期:</span>
                                <span class="item_val">{{carData.time_begin +'——'+carData.time_end}}</span>
                            </div>
                            <div class="list_item widthP25">
                                <span class="item_key">是否过期:</span>
                                <span class="item_val">{{cfg.expiredStatus[carData.is_expired]}}</span>
                            </div>
                            <div class="list_item widthP25" v-if='carData.is_expired ==="Y"'>
                                <span class="item_key">月卡过期时长:</span>
                                <span class="item_val">{{carData.epiredTime}}</span>
                            </div>
                        </template>
                        <div class="list_item widthP25">
                            <span class="item_key">车辆状态:</span>
                            <span class="item_val">{{cfg.reason[carData.reason]}}</span>
                        </div>
                        <div class="list_item widthP25">
                            <span class="item_key">开闸原因:</span>
                            <span class="item_val">{{(cfg.reason[carData.reason]||"") + (cfg.direction[direction]||'')}}</span>
                        </div>
                        <template v-if='isShared'>
                            <div class="list_item widthP25">
                                <span class="item_key">车位数:</span>
                                <span class="item_val">{{carData.space+'个'}}</span>
                            </div>
                            <div class="list_item widthP100">
                                <span class="item_key">共享车牌:</span>
                                <span class="item_val">
                                    {{carData.share_plates}}
                                    <el-button size="mini" v-if='plateShowbtn' @click='showMorePlates'>更多</el-button>
                                </span>
                            </div>
                            <div class="list_item widthP100">
                                <span class="item_key">当前场内共享车辆:</span>
                                <span class="item_val">{{carData.instation_plates}}</span>
                            </div>
                        </template>
                    </div>
                </div>
            </section>
            <template v-if='direction==="out"'>
                <section class="service_section mt10" v-if='isBlurMatch'>
                    <h2>车牌模糊搜索</h2>
                    <div class="service_infoBox">
                        <p>未找到该车辆的进场记录。系统已启用车牌模糊搜索功能，已为你匹配 {{cfg.matchnumber}} 条与该车牌相近的当前在场内的车辆进场信息，请选择。</p>
                        <div class="info_lists">
                            <div class="list_item widthP50 match__item" v-for="(item,index) in matchCarArr" :key="index">
                                <div class="match_img">
                                    <img :src="item.image_url" alt="" />
                                </div>
                                <div class="match_img_text">
                                    <span>{{item.plate}}</span><span>{{item.arrival}}</span>
                                </div>
                                <div class="match_img_btn">
                                    <el-button size="small" type="primary" @click='confirmClick(item.plate,item.car)'>确认为该车辆</el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="service_section mt10" v-if='carData.reason!="norecoder"&&carData.reason!="month"'>
                    <h2>缴费信息</h2>
                    <div class="service_infoBox">
                        <div class="info_lists">
                            <div class="list_item widthP33">
                                <span class="item_key">进场时间:</span>
                                <span class="item_val">{{payInfo.arrive}}</span>
                            </div>
                            <div class="list_item widthP33">
                                <span class="item_key">停车时长:</span>
                                <span class="item_val">{{payInfo.parktime}}</span>
                            </div>
                            <div class="list_item widthP33">
                                <span class="item_key">缴费状态:</span>
                                <span class="item_val">{{cfg.ispayStatus[payInfo.status]}}</span>
                            </div>
                            <div class="list_item widthP25">
                                <span class="item_key">停车费用:</span>
                                <span class="item_val">{{payInfo.money+'元'}}</span>
                            </div>
                            <div class="list_item widthP25">
                                <span class="item_key">优惠金额:</span>
                                <span class="item_val">{{payInfo.free+'元'}}</span>
                            </div>
                            <div class="list_item widthP25">
                                <span class="item_key">应付费用:</span>
                                <span class="item_val">{{payInfo.total+'元'}}</span>
                            </div>
                            <div class="list_item" v-if="payInfo.status==='Y'">
                                <span class="item_key">订单号:</span>
                                <span class="item_val">{{payInfo.tnum}}</span>
                                <span class="item_val">
                                    <el-button size="mini" @click='showOrderDetail'>查看订单详情</el-button>
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </template>
            <!-- 进场操作 -->
            <section class="service_section mt10" v-if="direction==='in'">
                <h2>操作</h2>
                <div class="service_infoBox">
                    <div class="operate_item" v-if='carData.reason==="month" && carData.reason!="position_occup"'>
                        <div class="o_text">开闸放行</div>
                        <div class="o_btn">
                            <el-button size="small" type="primary" :disabled='openBtn' @click='openHandler'>开闸</el-button>
                        </div>
                    </div>
                    <template v-if="carData.reason==='overdue'">
                        <div class="operate_item">
                            <div class="o_text">过期月卡临停进场</div>
                            <div class="o_btn">
                                <el-button size="small" type="primary" :disabled='openBtn' @click="openHandler">开闸</el-button>
                            </div>
                        </div>
                        <div class="operate_item" v-if="overdue_temp">
                            <div class="o_text">月卡续费入场，发送月卡缴费二维码到显示屏</div>
                            <div class="o_btn">
                                <el-button size="small" type="primary" @click="handleRobot">发送到显示屏</el-button>
                            </div>
                        </div>
                    </template>
                    <template v-if="carData.reason==='position_occup'">
                        <div class="operate_item">
                            <div class="o_text">开闸放行</div>
                            <div class="o_btn">
                                <el-button size="small" type="primary" :disabled='openBtn' @click="openHandler('share')">开闸</el-button>
                            </div>
                        </div>
                        <div class="operate_item">
                            <div class="o_text">若该场不允许共享车位被占进场，所以请告知该客户无法进场。</div>
                            <div class="o_btn">
                                <el-button size="small" type="primary" @click="handleRobot">发送到显示屏</el-button>
                            </div>
                        </div>
                    </template>
                    <div>
                        <el-form :model="tempSheet" label-width="130px" v-if='carData.reason==="temp"'>
                            <el-form-item label="车主手机号:">
                                <el-input v-model="tempSheet.mobile" class='widthP80'></el-input>
                            </el-form-item>
                            <el-form-item label="进场原因:">
                                <el-input type="textarea" v-model="tempSheet.remark" class='widthP80'></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" size="small" :disabled='openBtn' @click='openHandler'>开闸</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                    <div class="operate_item" v-if="carData.reason==='noplate'">
                        <div class="o_text">无牌车入场，发送该场无牌车进场二维码到显示屏</div>
                        <div class="o_btn">
                            <el-button size="small" type="primary" @click='handleRobot'>发送到显示屏</el-button>
                        </div>
                    </div>
                </div>
            </section>
            <!-- 出场操作 -->
            <section class="service_section mt10" v-if="direction==='out'">
                <h2>操作</h2>
                <div class="service_infoBox">
                    <div class="operate_item" v-if="(carData.reason==='overdue' && !overdue_temp)||carData.reason==='month' || payInfo.status==='Y'">
                        <div class="o_text">开闸放行</div>
                        <div class="o_btn">
                            <el-button size="small" type="primary" :disabled='openBtn' @click='openHandler'>开闸</el-button>
                        </div>
                    </div>
                    <!-- 过期月卡 -->
                    <template v-if="carData.reason==='overdue' && overdue_temp ">
                        <!-- <div class="operate_item">
                            <div class="o_text">过期月卡临停入场</div>
                            <div class="o_btn">
                                <el-button size="small" type="primary" :disabled='openBtn' @click='openHandler'>月卡过期快速离场</el-button>
                            </div>
                        </div> -->
                        <div class="operate_item">
                            <div class="o_text">月卡续费出场，发送月卡缴费二维码到显示屏</div>
                            <div class="o_btn">
                                <el-button size="small" type="primary" @click="handleRobot">发送到显示屏</el-button>
                            </div>
                        </div>
                        <div class="operate_item">
                            <div class="o_text">临停缴费出场，发送临停缴费缴费提醒到机器人</div>
                            <div class="o_btn">
                                <el-button size="small" type="primary" @click="handleRobot('temp')">临停快速码推送&出示付款码</el-button>
                            </div>
                        </div>
                    </template>
                    <!-- 临停出场 -->
                    <div class="operate_item" v-if="carData.reason==='temp'||carData.reason==='position_occup'">
                        <div class="o_text">临停缴费出场，发送临停缴费缴费提醒到机器人</div>
                        <div class="o_btn">
                            <el-button size="small" type="primary" @click="handleRobot">临停快速码推送&出示付款码</el-button>
                        </div>
                    </div>
                    <!-- 无牌车出场 -->
                    <div class="operate_item" v-if="carData.reason==='noplate'">
                        <div class="o_text">普通临停出场，发送该场快速出场缴费二维码到显示屏</div>
                        <div class="o_btn">
                            <el-button size="small" type="primary" @click='handleRobot'>发送到显示屏</el-button>
                        </div>
                    </div>
                    <!-- 无进场信息出场 -->
                    <div class="operate_item" v-if="carData.reason==='recover'">
                        <div class="o_text">快速出场缴费二维码到显示屏</div>
                        <div class="o_btn">
                            <el-button size="small" type="primary" @click='handleRobot'>发送到显示屏</el-button>
                        </div>
                    </div>
                </div>
            </section>
            <!-- 异常开闸进场 -->
            <section class="service_section mt10" v-if='(carData.reason==="temp"||carData.reason==="noplate")&&direction==="in"'>
                <!-- 进场 普通临停 -->
                <h2>异常开闸</h2>
                <div class="service_infoBox">
                    <el-form :model="excepteForm" label-width="130px">
                        <el-form-item label="开闸原因:">
                            <el-radio-group v-model="excepteForm.reason">
                                <el-radio v-for="(v,k,index) in cfg.excepteMap" :label="k" :key='index'>{{ v }}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="备注:">
                            <el-input type="textarea" placeholder="控制在150汉字左右" :disabled='can_input_plate' v-model="excepteForm.mark" class='widthP80'></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="danger" size="small" :disabled='exceptionOpenBtn' @click='exceptionOpenHandler'>异常放行</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </section>
            <!-- 异常开闸出场 -->
            <section class="service_section mt10" v-if='direction!=="in"'>
                <!-- 出场 普通临停 无牌车 无进场纪录 -->
                <h2>异常开闸</h2>
                <div class="service_infoBox">
                    <el-form :model="excepteForm" label-width="130px">
                        <el-form-item label="开闸原因:">
                            <el-radio-group :disabled='can_input_plate' v-model="excepteForm.reason">
                                <el-radio v-for="(v,k,index) in cfg.excepteMap" :label="k" :key='index'>{{ v }}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="证据留存:">
                            <div class="camera_wrap">
                                <div class="camera_item widthP50">
                                    <div class="c_header">
                                        <span>证件摄像头</span>
                                        <el-switch v-model="camera_near_switch" :disabled='can_input_plate' active-color="#24e06c" inactive-color="#bbbbbb" @change='openNearCamera'> </el-switch>
                                        <span class="red">需要保存图片证据方可打开该功能</span>
                                    </div>
                                    <div class="c_body camerabg" ref='nearCamera'>
                                        <img :src="currentNearImg" alt="" />
                                    </div>
                                    <div class="c_foot">
                                        <el-button type="primary" :disabled='can_input_plate' size="small" @click='nearScreenShot'>近景截图</el-button>
                                    </div>
                                </div>
                                <div class="camera_item widthP50">
                                    <div class="c_header">
                                        <span>截图</span>
                                    </div>
                                    <div class="c_body" v-loading='nearScreenShotLoading' :class="{ 'camerabg': nearImages.length===0 }">
                                        <div class="camera_img_lists">
                                            <ul>
                                                <li v-for="(item,index) in nearImages" :key='index'>
                                                    <div class="imgbox" @click="imgshow('near', index)"><img :src="item" alt="" /></div>
                                                    <div class="img_clear_icon">
                                                        <i class="fa fa-trash-o fa-lg" @click='delCameraImg(index,"nearImages")'></i>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="camera_wrap mt15">
                                <div class="camera_item widthP50">
                                    <div class="c_header">
                                        <span>环境摄像头</span>
                                        <el-switch v-model="camera_far_switch" :disabled='can_input_plate' active-color="#24e06c" inactive-color="#bbbbbb" @change='openFarCamera'> </el-switch>
                                        <span class="red">需要保存图片证据方可打开该功能</span>
                                    </div>
                                    <div class="c_body camerabg" ref='farCamera'>
                                    </div>
                                    <div class="c_foot">
                                        <el-button type="primary" size="small" v-if='camera_far_switch' @click='farScreenShot'>远景截图</el-button>
                                    </div>
                                </div>
                                <div class="camera_item widthP50">
                                    <div class="c_header">
                                        <span>截图记录</span>
                                    </div>
                                    <div class="c_body" v-loading='farScreenShotLoading' :class="{ 'camerabg': farImages.length===0 }">
                                        <div class="camera_img_lists">
                                            <ul>
                                                <li v-for="(item,index) in farImages" :key='index'>
                                                    <div class="imgbox" @click="imgshow('far', index)"><img :src="item" alt="" /></div>
                                                    <div class="img_clear_icon">
                                                        <i class="fa fa-trash-o fa-lg" @click='delCameraImg(index,"farImages")'></i>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-form-item>
                        <el-form-item label="备注:">
                            <el-input type="textarea" v-model="excepteForm.mark" placeholder="控制在150汉字左右" class='widthP80'></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="danger" size="small" :disabled='exceptionOpenBtn||can_input_plate' @click='exceptionOpenHandler'>异常放行</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </section>
            <section class="service_section mt10">
                <div class="cs_btn_box">
                    <!-- <span class="closeSheet_Btn" :disabled='can_input_plate' @click='closeSheet'>关单</span> -->

                    <el-button size="small" type="primary" :disabled='can_input_plate' @click='clearSeat();closeSheet()'>关单</el-button>
                </div>
            </section>
            <el-dialog :title="commonDialog.title" :visible.sync="commonDialog.show" width="30%">
                <div class="tc">{{commonDialog.content}}</div>
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="commonDialog.show = false">确 定</el-button>
                </span>
            </el-dialog>
            <el-dialog :title="orderPopwin.title" :visible.sync="orderPopwin.show" width='80%'>
                <el-table element-loading-text="拼命加载中" :data="orderData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"><span>{{props.row.area_name}}/{{props.row.dept_name}}</span></el-form-item>
                                <el-form-item label="支付来源:">
                                    <span>{{cfg.source[props.row.source]||props.row.source}}</span>
                                </el-form-item>
                                <el-form-item label="供应商:"><span>{{ props.row.vendor_name }}</span></el-form-item>
                                <el-form-item v-if="props.row.source != 'WECHAT' && props.row.source != 'WX_AGUA'" label="用户名:"><span>{{ props.row.user_name }}</span></el-form-item>
                                <el-form-item label="第三方单号:"><span>{{ props.row.third_tnum }}</span></el-form-item>
                                <el-form-item label="预付单号:"><span>{{ props.row.related_tnum }}</span></el-form-item>
                                <el-form-item v-if='!!props.row.cost_price' :label="props.row.discount_type+'/原价:'"><span>{{props.row.cost_price}} </span></el-form-item>
                                <el-form-item label="月卡价格:" v-if="props.row.type == 'MONTH'"><span>{{ props.row.rent }}</span></el-form-item>
                                <el-form-item v-if="props.row.source != 'WECHAT' && props.row.source != 'WX_AGUA'" label="手机号:"><span>{{ props.row.user_phone }}</span></el-form-item>
                                <el-form-item v-if="props.row.source == 'WECHAT' || props.row.source == 'WX_AGUA'" label="微信openID:"><span>{{ props.row.user_openid }}</span></el-form-item>
                                <el-form-item label="月卡规则:"><span>{{ props.row.rule_name }}</span></el-form-item>
                                <el-form-item label="创建时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.modifytime }}</span></el-form-item>
                                <el-form-item label="开票状态:"><span>{{cfg.invoice[props.row.invoice]}}</span></el-form-item>
                                <el-form-item v-if="props.row.type == 'MONTH'" label="购买时间段:"><span>{{ props.row.arrival + "    " + props.row.departure }}</span></el-form-item>
                                <el-form-item label="付款二维码:" v-if="props.row.qrcode">
                                    <qrcode :value="props.row.qrcode"></qrcode>
                                </el-form-item>
                                <div>
                                    <el-form-item v-if="props.row.download == 'N'" label="下发失败原因:"><span>{{ props.row.content }}</span></el-form-item>
                                </div>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="30"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="120"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="80"></el-table-column>
                    <el-table-column prop="tnum" label="易停订单号" min-width="200"></el-table-column>
                    <el-table-column prop="amount" label="金额" min-width="60"></el-table-column>
                    <el-table-column label="来源" min-width="80">
                        <template slot-scope="scope">
                            <span>{{cfg.source[scope.row.source]||scope.row.source}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="类型" width="55">
                        <template slot-scope="scope">
                            <span>{{cfg.type[scope.row.type]||'未知'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="88">
                        <template slot-scope="scope">
                            <span :class="{'green':scope.row.status == 'paid'}">{{cfg.paystatus[scope.row.status]||'未知'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="开闸/下发" min-width="65">
                        <template slot-scope="scope" v-if="scope.row.vendor_id != 0 && scope.row.status == 'paid'">
                            <span v-if='scope.row.type !== "BOOKING"' :class="{'red':scope.row.download == 'N'}">{{cfg.send[scope.row.type]+cfg.send[scope.row.download]}}</span>
                            <span v-else></span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="paytime" label="支付时间" min-width="140">
                        <template slot-scope="scope" v-show="scope.row.paytime">
                            <span v-if="scope.row.status == 'paid'">{{scope.row.paytime}}</span>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="tc mt15">
                    <el-button size='small' type="primary" @click="goPaymentList">订单操作</el-button>
                </div>
            </el-dialog>
            <my-image-lists v-if="images.show" @close="imgClose" :images="images.lists" :currentPreview="currentImgPreview"></my-image-lists>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
import ezuikit from '../../../utils/ezuikit.js';
import Robot from '../../../utils/robot.js';
const config = window.etback.config
export default {
    data: function () {
        let cfg = {
            url: {
                unlockCustom: '/custom/unlock',
                setCustom: '/custom/search',
                deviceList: '/device/lists?page=1&pagesize=20&type=1&status=Y',
                parkedwhere: '/car/parkedwhere?plate=', //是否在场内 plate= ''; car_id= '';均可
                lists: '/contract/lists?page=1&pagesize=1&status=working,created&car_id=', //car_id
                orderlists: '/order/payment?page=1&pagesize=1&sort_type=3&car_id=', //car_id
                insideCar: '/custom/insidePlate', //在场内车牌post
                getMoney: '/temp/money', //计算优惠 plate   station_id
                getTempmoney: '/temp/tempMoney', //计算临停计费 car_id   station_id
                getPlate: '/butler/getPlate?device_id=', //根据道闸id获取车牌  device_id
                matchCar: '/butler/fiveIn', //  模糊匹配车辆   plate  station_id
                fixPlate: '/custom/fixPlate', //车牌修正接口get  true_plate  station_id
                openDevice: '/custom/open', //
                inlist: '/inout/inlists?page=1&pagesize=1&station_id=', //进场纪录
                outlist: '/inout/outlists?page=1&pagesize=1&station_id=', //出场纪录
                inOutImg: '/inout/images', //出场纪录 date id station_id  type
                getSeat: '/custom/lists',
                noplatecost: '/unlicense/cost', //无牌车计费
                screenshot: '/custom/screenshot',
                control: '/custom/remoteControl',
                wsuri: config.wsshost,
            },
            station: '',
            closeVideoTime: 60 * 1000, //针对视频截图  1分钟关闭视频
            source: utils.config.payMethod,
            paystatus: utils.config.payStatus,
            type: { 'MONTH': "月卡", 'TEMP': "临停", 'BOOKING': "车位锁预约", 'NOFEEL': "无感支付" },
            send: { 'MONTH': "下发", 'TEMP': "开闸", 'BOOKING': "下发", 'NOFEEL': "开闸", 'Y': "成功", 'N': "失败" },
            invoice: { '1': '开票中', '2': '成功', '3': '失败', '4': '已红冲', '5': '待签章', 'N': '未开票' },
            sortType: { '1': '支付时间搜索', '2': '创建时间搜索', '3': '最后更新时间搜索' },
            month: { Y: '月卡', N: '临停', U: '未知' },
            isMonth: { Y: '是', N: '否' },
            ispayStatus: { Y: '已支付', N: '未支付' },
            expiredStatus: { Y: '过期', N: '未过期' },
            excepteLists: [{ value: 'specail_car', name: '特殊车辆' }, { value: 'specail_user', name: '特殊人员' }, { value: 'no_motor', name: '非机动车' }],
            excepteMap: { 'specail_car': '特殊车辆', 'specail_user': '特殊人员', 'no_motor': '非机动车' },
            direction: { 'in': '进场', 'out': '出场' },
            reason: {
                'month': '有效月卡',
                'overdue': '月卡过期',
                'position_occup': '月卡共享车位被占',
                'temp': '普通临停',
                'recover': '无进场信息',
                'noplate': '无牌车' //这种情况要开闸就发  specail_car
            },
            status: { "apply": "apply", "created": "已创建", "working": "使用中", "locked": "已禁用", "delayed": "delayed", "canceled": "已取消", 'deleted': '已删除' },
            matchnumber: 6, //模糊匹配纪录 默认显示最多6个
            showPlatesNum: 6, //共享车牌 页面默认显示最多6个
            camera_img_limit: 4, //远景或者近景图片最大张数
            overdue_days: 3, //月卡过期 天数
            timeout: 30000, // websocket心跳
        }
        return {
            cfg,
            currentMessage: {},
            oa_seat_id: '',
            station_device_user: '',//项目人员坐席号或客服不绑定客服直接以项目人员身份使用时的坐席号
            roadItem: {},
            roadList: [],
            roadId: '',
            selectStation: '',
            projectManger: false,
            direction: '',
            can_input_plate: true,
            commonDialog: { title: '提示', show: false, content: '' },
            orderPopwin: { title: '订单详情', show: false },
            robotInfo: { extcode: '', mobile: '', number: '', station_name: '__', device_name: '__', station_id: '', device_id: '', seat_id: '', video: { deviceSerial: '', hls: '', hlsHd: '' } }, //接听概况
            camera_switch: false, //环境摄像头
            camera_far_switch: false, //远景摄像头
            camera_near_switch: false, //近境摄像头
            isBlurMatch: false,
            isShared: false,
            plateShowbtn: false,
            overdue_temp: false, //月卡过期时间在指定期待内的 比如只过期了3天
            excepteForm: { reason: 'specail_car', mark: '' },
            tempSheet: { reason: '', mobile: '' },
            carData: { car_id: '', plate: '', plates: [], rule: '', time_begin: '', time_end: '', rule_name: '', rule_N1: '', station_id: '', station_name: '', arrival: '', isMonth: '', epiredTime: '', share_carids: '', share_plates: '', space: '', instation_plates: '', reason: '', }, //车辆信息
            payInfo: { arrive: '__', parktime: '__', status: 'N', total: 0, free: 0, money: 0, tnum: '' }, //缴费信息
            plates: [],
            matchCarArr: [], //模糊匹配车辆 数组
            true_plate: '', //更正车牌
            true_phone: '', //更正手机号
            images: { show: false, lists: [] },
            user: { user_id: '', global_oa: '', global_name: '' },
            inOutId: '', // 进出场纪录的ID
            current_device_image: '', // 当前道闸图片
            orderDetal: null,
            orderData: [],
            farImages: [],
            farScreenShotLoading: false,
            nearImages: [], //近景拍照
            currentNearImg: '', // 当前近景照片
            nearScreenShotLoading: false,
            websock: null,
            heartTime: null,
            inoutType: '',
            openBtn: false,
            exceptionOpenBtn: false,
            myEZPlayer: '',
            robotScrrenImg: '',
            currentImgPreview: 1
        }
    },
    created() {
        utils.addScript('qrcode', '/static/js/qrcode.min.js');
    },
    watch: {

    },
    mounted() {
        let store = this.$store.state.global.login.data;
        this.user = { user_id: store.user_id, global_oa: store.user_name, global_name: store.user_realname };
        //判断当前登录的人有没有  智能客服-项目人员权限
        this.projectManger = this.authCheck('智能客服-项目人员');
        this.initWebSocket()
        /**
         * 根据坐席号去设置机器人数据
         */
        const params = this.$route.params;
        if (JSON.stringify(params) != '{}') {
            this.setRobotData(params) //坐席号匹配了再设置页面信息
            this.init();
        }
        this.getSeatId();
    },
    methods: {
        //清除坐席接听状态
        clearSeat() {
            if (!this.station_device_user) {
                return
            }
            let station_device_user = this.station_device_user;
            let url = this.cfg.url.unlockCustom;
            let postData = {
                station_device_user
            }
            utils.fetch(url, { method: 'POST', body: postData }).then((res) => {
                if (res && res.code == '0') {
                    this.$router.go();
                } else {
                    this.$message({ showClose: true, message: res.message, type: 'error' })
                }
            })
        },

        //配置当前项目人员为客服，若已经是客服，将以项目人员身份做客服处理
        setprojectManger() {
            if (!this.selectStation) {
                return this.$message({ showClose: true, message: '缺少停车场信息', type: 'error' })
            }
            if (!this.roadId) {
                return this.$message({ showClose: true, message: '缺少出入口信息', type: 'error' })
            }
            if (!this.roadItem.direction) {
                return this.$message({ showClose: true, message: '缺少道闸信息', type: 'error' })
            }

            this.openBtn = false;
            let station_device_user = this.selectStation + '_' + this.roadId + '_' + this.user.user_id;//车场  设备  用户id组装成  客服坐席号
            this.station_device_user = station_device_user;
            let url = this.cfg.url.setCustom;
            this.robotInfo.seat_id = station_device_user;
            let postData = {
                direction: this.roadItem.direction,
                station_device_user
            }
            this.clearAll();
            utils.fetch(url, { method: 'POST', body: postData }).then((res) => {
                if (res && res.code == '0') {
                    setTimeout(() => {
                        this.$router.go();
                    }, 1000 * 60 * 10)
                } else {
                    this.$message({ showClose: true, message: res.message, type: 'error' })
                }
            })

        },
        //跟进停车场获取道闸信息
        getroadList(station_id) {
            if (!station_id) {
                return this.$message({ showClose: true, message: '缺少停车场id', type: 'error' });
            }
            let url = `${this.cfg.url.deviceList}&station_id=${station_id}`;
            return utils.fetch(url).then((res) => {
                if (res && res.content) {
                    let list = res.content.lists || [];
                    this.roadList = list;
                } else {
                    this.$message({ showClose: true, message: res.message, type: 'error' })
                }
            })
        },
        stationChange(item) {
            this.roadId = '';
            this.roadList = [];
            if (item.id) {
                this.getroadList(item.id);
            }
        },
        roadChange(id) {
            this.roadItem = this.roadList.find((el) => {
                if (el.id === id) {
                    return el;
                }
            })
        },
        authCheck(tag) {
            return utils.authCheck(this, tag);
        },
        //智能客服-项目人员
        initWebSocket() { //初始化websocket
            if ('WebSocket' in window) {
                const wsuri = this.cfg.url.wsuri;
                this.websock = new WebSocket(wsuri); //这里面的this都指向vue
                this.websock.onopen = this.websocketopen;
                this.websock.onmessage = this.websocketonmessage;
                this.websock.onclose = this.websocketclose;
                this.websock.onerror = this.websocketerror;
            } else {
                console.log('do not support websocket')
            }
        },
        websocketonmessage(e) { //数据接收
            const { path } = this.$route;
            this.heartCheck();
            if (e.data === 'connected' || e.data === 'ting') { console.log('connected or ting'); } else {
                let data = JSON.parse(e.data);
                console.log('消息推送', data, this.robotInfo.seat_id)
                if (data.cno && (data.cno == this.robotInfo.seat_id || data.cno == this.oa_seat_id)) {
                    this.currentMessage = data;
                    this.clearAll();
                    if (path !== '/cService/server') {
                        if (data.type === 'robot') {
                            this.$router.push({ path: '/cService/server', name: '新版智能客服', params: data })
                        } else {
                            this.$router.push({ path: '/cService/control', name: '日常管控', params: data })
                        }
                    } else {
                        if (data.type === 'robot') { //机器人
                            this.setRobotData(data) //坐席号匹配了再设置页面信息
                            this.init();
                        } else { //data.type==='usual' 日常管控
                            this.$router.push({ path: '/cService/control', name: '日常管控', params: data })
                        }
                    }
                }
            }
        },
        websocketopen() { console.log("WebSocket连接成功") },
        websocketclose() {
            console.log("WebSocket关闭");
            clearTimeout(this.heartTime)
            this.initWebSocket()
        },
        websocketerror() { console.log("WebSocket连接失败"); },
        closewebsocket() { this.websock && this.websock.close() },
        heartCheck() {
            var vm = this;
            vm.heartTime = setTimeout(function () {
                if (vm.websock && vm.websock.readyState == 1) {
                    vm.websock.send("ting");
                }
            }, vm.cfg.timeout)
        },
        setRobotData(data) {
            if (data) {
                let robotInfo = this.robotInfo;
                robotInfo.admin = data.station.admin;
                robotInfo.admin_mobile = data.station.admin_mobile;
                robotInfo.station_name = data.station.station_name;
                robotInfo.station_id = data.station.station_id;
                robotInfo.device_name = data.device.name;
                robotInfo.device_id = data.device.device_id;
                robotInfo.extcode = data.device.extcode;
                robotInfo.mobile = data.robot.robot_mobile;
                robotInfo.number = data.robot.number;
                robotInfo.video = { ...data.ys_info };
                robotInfo.cno = data.cno //ws推过来的坐席号
                robotInfo.allow_other = data.allow_other //不允许外来车辆
                this.robotInfo = robotInfo;
                this.direction = data.device && data.device.direction;
                this.selectStation = robotInfo.station_id;
                setTimeout(() => {
                    this.roadId = parseInt(robotInfo.device_id) || '';
                    this.roadItem.direction = data.device.direction;
                    console.log('robotInfo.device_id', robotInfo.device_id)
                }, 1000)
                if (robotInfo.allow_other === 'N') {
                    this.inoutType = 'forbidden_in' //禁止临停
                }

            }

            // FIXME: 提交代码的时候屏蔽mocke 数据
            // robotInfo.number = 100;
            // robotInfo.station_id = 100;
            // robotInfo.device_id = 54325;
            // direction = 'in';
        },
        init() {
            console.log('init')
            let vm = this;
            vm.can_input_plate = false;
            this.getPlate().then(() => {
                if (!vm.carData.plate) {
                    vm.carData.reason = 'noplate';
                    // vm.setInOutType(); //无牌车
                } else {
                    vm.updataAll();
                }
            }).catch(err => { console.log(err) })

        },
        updataAll() {
            let vm = this;
            this.getDeviceImg();
            this.getMonthData().then(() => { //查询月卡信息，判断 过期时长，共享车位
                if (this.direction === 'in') {
                    //进场时，getMonthData只判断状态即可
                } else if (this.direction === 'out') {
                    //出场先检查是不是在场内
                    this.isInStation().then(() => {
                        //出场时判断过期月卡 查询缴费信息
                        if (vm.carData.reason != 'recover') { //有纪录
                            vm.getMoney().then(() => {
                                vm.getTempmoney();
                            })
                        } else { //无纪录 模糊匹配
                            //暂定传车牌 函数内部取全局车牌
                            vm.getMatchPlates();
                        }
                    });
                }
            });
        },
        goBindSeat() {
            let r = { path: '/cService/index' };
            this.$router.push(r);
            // this.closewebsocket();
        },
        getSeatId() {
            let vm = this;
            if (!vm.user.global_oa) {
                return this.$message({ showClose: true, message: '缺少OA账号信息', type: 'error' })
            }
            let url = `${vm.cfg.url.getSeat}?oa=${vm.user.global_oa}`;
            return utils.fetch(url).then((res) => {
                if (typeof res != "undefined") {
                    if (res.code === 0) {
                        if (res.content.length === 0) {
                            //   vm.seatDialog = { title: '提示', show: true, content: '您未绑定坐席号！' };
                        } else {
                            vm.oa_seat_id = res.content.seat || '';
                            vm.robotInfo.seat_id = res.content.seat || '';
                        }
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        showMorePlates() {
            let str = this.getPlatesIDs(this.carData.plates, 'strs');
            this.commonDialog = { title: '场内全部车牌', show: true, content: str }
        },
        //通过道闸取车牌 `${}`
        getPlate() {
            let vm = this;
            if (!vm.robotInfo.device_id) {
                return this.$message({ showClose: true, message: '缺少道闸信息', type: 'error' })
            }
            let url = `${vm.cfg.url.getPlate}${vm.robotInfo.device_id}`;
            return utils.fetch(url).then((res) => {
                if (typeof res != "undefined") {
                    if (res.code === 0) {
                        if (res.content.length > 0) {
                            let { plate, id: car_id } = res.content[0];
                            vm.carData.plate = plate;
                            vm.carData.car_id = car_id;
                        }
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        //初始化月卡信息
        initmonthData(car_id = '', plate = '') {
            this.carData = { car_id, plate, plates: [], rule: '', time_begin: '', time_end: '', rule_name: '', rule_N1: '', station_id: '', station_name: '', arrival: '', isMonth: '', epiredTime: '', share_carids: '', share_plates: '', space: '', instation_plates: '', reason: '', };
        },
        //根据车牌号去查月卡信息 判断是否为有效月卡,无效月卡,车位被占,无牌车,普通临停,无进场纪录等情况
        getMonthData() {
            let vm = this;
            if (!vm.robotInfo.station_id) {
                return this.$message({ showClose: true, message: '缺少停车场信息', type: 'error' })
            }
            if (!vm.carData.car_id) {
                return this.$message({ showClose: true, message: '缺少车辆信息', type: 'error' })
            }
            let url = `${vm.cfg.url.lists}${vm.carData.car_id}&station_id=${vm.robotInfo.station_id}`;
            return utils.fetch(url).then((res) => {
                if (typeof res != "undefined") {
                    if (res.code === 0) {
                        if (res.content && res.content.lists && res.content.lists.length > 0) {
                            //月卡车
                            let data = res.content.lists[0];
                            vm.carData.isMonth = 'Y';
                            vm.carData.reason = 'month';
                            vm.carData = { ...vm.carData, ...data }; //设置车辆所有信息
                            //  判断有没有过期
                            vm.isMonthExpired();
                        } else {
                            //无月卡纪录
                            vm.carData.isMonth = 'N';
                            vm.carData.reason = 'temp';
                            // vm.setInOutType(); //临停
                        }
                    } else {
                        //无月卡纪录
                        vm.carData.isMonth = 'N';
                        vm.carData.reason = 'temp';
                        // vm.setInOutType(); //临停
                        //除了code===0是月卡，其余都是临停
                    }
                }
            })
        },
        /**  {[type]} arr  [车牌数组] {[type]} type ['str''ids'] **/
        getPlatesIDs(arr, type) {
            if (!Array.isArray(arr)) { consol.log('参数不是车牌数组'); return }
            let strArr = [];
            let idsArr = [];
            arr.forEach(item => {
                idsArr.push(item.car_id)
                strArr.push(item.plate)
            })
            if (type === 'ids') {
                return idsArr.join(',')
            } else {
                return strArr.join(',')
            }
        },
        //计算月卡是否过期
        isMonthExpired() {
            let vm = this;
            var end = new Date(vm.carData.time_end);
            var now = new Date();
            let epired = !!(end.getTime() < now.getTime())
            if (epired) {
                vm.carData.is_expired = 'Y';
                vm.carData.reason = 'overdue';
                vm.getMonthExpire();
            } else {
                //月卡没过期的情况才判断共享车位的情况
                vm.isSharedPosition();
                vm.carData.is_expired = 'N';
                // vm.setInOutType();
            }
        },
        //判断共享车位
        isSharedPosition() {
            let vm = this;
            let plates = vm.carData.plates;
            if (plates.length > 1) {
                vm.isShared = true;
                let maxnum = vm.cfg.showPlatesNum;
                if (plates.length > maxnum) {
                    let arr = plates.slice(0, maxnum);
                    vm.carData.share_plates = vm.getPlatesIDs(arr, 'strs');
                    vm.plateShowbtn = true;
                } else {
                    vm.carData.share_plates = vm.getPlatesIDs(plates, 'strs');
                    vm.plateShowbtn = false;
                }
                vm.carData.share_carids = vm.getPlatesIDs(plates, 'ids');
                vm.getPlatesInStation(vm.carData.share_carids)
            } else {
                vm.isShared = false;
            }
        },
        //计算月卡过期时间
        getMonthExpire() {
            let vm = this;
            let end = vm.carData.time_end;
            let reduce = new Date().getTime() - new Date(end).getTime();
            //毫秒数计算天数
            let diffstr = utils.differenceTime(reduce, 2);
            vm.carData.epiredTime = diffstr;
            if (parseInt(diffstr) <= vm.cfg.overdue_days) {
                vm.overdue_temp = false;
                // vm.setInOutType(); //月卡过期3天内
            } else {
                vm.overdue_temp = true;
                // vm.setInOutType(); //月卡超3天
            }
        },
        //计费时 出场 查询车辆是否在场内
        isInStation() {
            let vm = this;
            if (!vm.carData.plate) {
                return this.$message({ showClose: true, message: '缺少车牌', type: 'error' })
            }
            let url = `${vm.cfg.url.parkedwhere}${vm.carData.plate}`;
            return utils.fetch(url).then((res) => {
                if (typeof res != "undefined") {
                    if (res.code === 0) {
                        if (res.content.arrival) {
                            //车在场内
                            vm.isBlurMatch = false;
                        } else {
                            vm.carData.reason = 'recover'; //无进场纪录
                            vm.isBlurMatch = true; //模糊匹配
                        }
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        //无进场纪录时模糊匹配  direction = out
        getMatchPlates() {
            let vm = this;
            if (!vm.carData.plate) {
                return this.$message({ showClose: true, message: '缺少车牌', type: 'error' })
            }
            if (!vm.robotInfo.station_id) {
                return this.$message({ showClose: true, message: '缺少停车场信息', type: 'error' })
            }
            let url = `${vm.cfg.url.matchCar}?plate=${vm.carData.plate}&station_id=${vm.robotInfo.station_id}`;
            utils.fetch(url).then((res) => {
                if (typeof res != "undefined") {
                    if (res.code === 0) {
                        if (Array.isArray(res.content.lists) && res.content.lists.length > 0) {
                            vm.matchCarArr = res.content.lists.slice(0, vm.cfg.matchnumber);
                        }
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        //确认为该车辆
        confirmClick(plate, carid) {
            console.log(plate)
            console.log(carid)
            //全局更新
            this.carData.plate = plate;
            this.carData.car_id = carid;
            this.updataAll();
        },
        //车位被占，场内车辆数及具体车牌
        getPlatesInStation(ids) {
            let vm = this;
            if (!ids) {
                return this.$message({ showClose: true, message: '缺少车牌', type: 'error' })
            }
            let data = { car_ids: ids };
            let url = `${vm.cfg.url.insideCar}`;
            utils.fetch(url, { method: 'POST', body: data }).then((res) => {
                if (typeof (res) != 'undefined') {
                    if (res.code === 0) {
                        vm.carData.instation_plates = res.content.plates.join(',');
                        if (res.content.plates.length >= vm.carData.space) {
                            //共享车位被占
                            vm.carData.reason = 'position_occup';
                            // vm.setInOutType();
                        }
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }

                }
            })
        },
        //无牌车,普通临停
        getTempStatus() { },

        //先获取进场纪录
        getInListsHistory(type) {
            let vm = this;
            if (!vm.carData.car_id) {
                return this.$message({ showClose: true, message: '缺少车牌信息', type: 'error' })
            }
            if (!vm.robotInfo.station_id) {
                return this.$message({ showClose: true, message: '缺少停车场信息', type: 'error' })
            }
            let url = type === 'in' ? `${vm.cfg.url.inlist}` : `${vm.cfg.url.outlist}`;
            url += `${vm.robotInfo.station_id}&car_id=${vm.carData.car_id}`
            return utils.fetch(url).then((res) => {
                if (typeof (res) != 'undefined') {
                    if (res.code === 0 && res.content) {
                        vm.inOutId = res.content[0].id;
                    } else {
                        vm.$message({ showClose: true, message: '暂无进场纪录,无法显示道闸口图片', type: 'error' })
                    }
                }
            })
        },
        //当前道闸图片
        getDeviceImg() {
            let vm = this;
            this.getInListsHistory(vm.direction).then(() => {
                if (!vm.inOutId) { console.log(`can\'t get lists_id about "${vm.direction}"`); return; }
                let now = new Date();
                let data = utils.timeParse(now, '-', false);
                let url = `${vm.cfg.url.inOutImg}?id=${vm.inOutId}&station_id=${vm.robotInfo.station_id}&type=${vm.direction}&data=${data}`;
                utils.fetch(url).then(res => {
                    if (res && res.code === 0) {
                        vm.current_device_image = vm.checkImagesSize(res.content);
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                })

            })
        },
        //比较图片尺寸大小  带 plate 的是小图
        checkImagesSize(arr) {
            let sizeArr = [];
            arr.forEach((item, index) => {
                if (item.href.indexOf('plate') < 0) {
                    sizeArr.push(item)
                }
            })
            return sizeArr[0].href
        },
        //更正手机号
        refreshPhone() {
            //无牌车通过手机号查询纪录
            let vm = this;
            if (vm.true_phone === '' || !utils.isMobile(vm.true_phone)) {
                vm.$message({ showClose: true, message: '请输入正确的手机号', type: 'error' });
                return
            }
            vm.payInfo = { arrive: '__', parktime: '__', status: 'N', total: 0, free: 0, money: 0, tnum: '' };
            let url = `${vm.cfg.url.noplatecost}?device_id=${vm.robotInfo.device_id}&mobile=${vm.true_phone}&client_id=${vm.user.user_id}`;
            utils.fetch(url).then((res) => {
                if (typeof (res) != 'undefined') {
                    if (res.code === 0 && res.content) {
                        let { money, begin, end } = res.content.info.result;
                        let { coupon_money, coupon_original } = res.content
                        let now_time = Date.now();
                        let beginStr = utils.strToDate(begin);
                        let start = new Date(beginStr).getTime();
                        let diff = now_time - start;
                        let parktime = utils.differenceTime(diff, 1);
                        vm.payInfo.parktime = parktime; //停车时长
                        vm.payInfo.arrive = beginStr; //进场时间
                        vm.payInfo.money = coupon_original; //计算总费用
                        vm.payInfo.free = coupon_money; //计算总费用
                        vm.payInfo.total = utils.calc(coupon_original, coupon_money, '-').toFixed(2); //计算优惠后的应付费用
                        vm.payInfo.total = vm.payInfo.total > 0 ? vm.payInfo.total : 0;
                        vm.payInfo.status = 'N';
                        vm.true_phone = '';
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        //更正车牌
        refreshPlate() {
            let vm = this;
            if (vm.true_plate === '') { vm.$message({ showClose: true, message: '请输入要查询的车牌', type: 'error' }); return }
            if (vm.robotInfo.station_id === '') {
                vm.$message({ showClose: true, message: '停车场ID不能为空', type: 'error' });
                return
            }
            let url = `${vm.cfg.url.fixPlate}?true_plate=${vm.true_plate}&station_id=${vm.robotInfo.station_id}`;
            utils.fetch(url).then((res) => {
                if (typeof res != "undefined") {
                    if (res.code === 0) {
                        //全局更新
                        vm.carData.plate = res.content.plate;
                        vm.carData.car_id = res.content.car_id;
                        vm.true_plate = '';
                        vm.initmonthData(vm.carData.car_id, vm.carData.plate);
                        vm.updataAll();
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        // //查询缴费信息
        // getOrderInfo() {
        //     console.log('getOrderInfo')
        //     this.getTempmoney();
        // },
        goPaymentList() {
            let params = { tnum: this.payInfo.tnum };
            let r = { name: '交易订单', path: '/order/payment', params };
            this.$router.push(r);
        },
        //查看订单详情
        showOrderDetail() {
            this.orderPopwin.show = true;
        },
        //计费优惠优惠
        getMoney() {
            let vm = this;
            if (!vm.carData.plate) {
                return this.$message({ showClose: true, message: '缺少车牌', type: 'error' })
            }
            if (!vm.robotInfo.station_id) {
                return this.$message({ showClose: true, message: '缺少停车场信息', type: 'error' })
            }
            let url = `${vm.cfg.url.getMoney}?plate=${vm.carData.plate}&station_id=${vm.robotInfo.station_id}`;
            return utils.fetch(url).then((res) => {
                if (typeof res != "undefined") {
                    if (res.code === 0) {
                        let { money, cover, coupon, attach } = res.content;
                        vm.payInfo.free = Number(money) //优惠金额
                        vm.payInfo.cover = cover
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        //查询缴费信息
        getTempmoney() {
            console.log('getTempmoney')
            //判断是否已经缴费
            let vm = this;
            if (!vm.carData.car_id) {
                return this.$message({ showClose: true, message: '缺少车牌信息', type: 'error' })
            }
            if (!vm.robotInfo.station_id) {
                return this.$message({ showClose: true, message: '缺少停车场信息', type: 'error' })
            }
            vm.payInfo = { arrive: '__', parktime: '__', status: 'N', total: 0, free: 0, money: 0, tnum: '' };
            let url = `${vm.cfg.url.getTempmoney}?car_id=${vm.carData.car_id}&station_id=${vm.robotInfo.station_id}`;
            utils.fetch(url).then((res) => {
                if (typeof res != "undefined") {
                    if (res.code === 0) {
                        let { money, begin, end } = res.content.info.result;
                        let now_time = Date.now();
                        let beginStr = utils.strToDate(begin);
                        //计算出场时间 方便查询近一个小时内的订单
                        let endStr = utils.strToDate(end);
                        let newEnd = new Date(endStr).getTime() + 60 * 60 * 1000;
                        let endtime = utils.timeParse(newEnd, '-', true);
                        vm.payInfo.end = endtime; //加了一个小时的离场时间为了查询订单
                        let start = new Date(beginStr).getTime();
                        let diff = now_time - start;
                        let parktime = utils.differenceTime(diff, 1);
                        vm.payInfo.parktime = parktime; //停车时长
                        vm.payInfo.arrive = beginStr; //进场时间
                        vm.payInfo.money = money; //计算总费用
                        vm.payInfo.status = 'N';
                        if (money > 0) {
                            let accdel = utils.calc(money, vm.payInfo.free, '-').toFixed(2)
                            accdel = accdel > 0 ? accdel : 0;
                            if (vm.payInfo.cover) {
                                vm.payInfo.total = vm.payInfo.free; //优惠金额
                                vm.payInfo.free = accdel
                            } else {
                                vm.payInfo.total = accdel; //计算优惠后的应付费用 
                            }
                        } else { //money === 0
                            //没产生费用  或者 已经缴费了
                            vm.getTnumByOrder();
                            vm.payInfo.total = 0;
                            vm.payInfo.free = 0;
                            vm.payInfo.money = 0;
                        }
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        //只查询订单信息
        getTnumByOrder() {
            let vm = this;
            if (!vm.carData.car_id) {
                return this.$message({ showClose: true, message: '缺少车牌信息', type: 'error' })
            }
            if (!vm.payInfo.arrive) {
                return this.$message({ showClose: true, message: '缺少进场时间', type: 'error' })
            }
            if (!vm.payInfo.end) {
                return this.$message({ showClose: true, message: '缺少出场时间', type: 'error' })
            }
            let url = `${vm.cfg.url.orderlists}${vm.carData.car_id}&begintime=${vm.payInfo.arrive}&endtime=${vm.payInfo.end}`;
            utils.fetch(url).then(function (res) {
                if (res.code == 0 && res.content && res.content.lists) {
                    let content = res.content.lists[0] || [];
                    vm.orderData = [{ ...content }] //储存订单信息 查看时直接显示
                    vm.payInfo.status = 'Y'; //请求返回后，再显示订单及按钮
                    vm.payInfo.tnum = content.tnum;
                } else {
                    vm.$message({ showClose: true, message: '出场未产生费用', type: 'error' })
                }
            });
        },
        //打开关闭环境摄像头
        createVideo(ref, id) {
            let video = document.createElement('video');
            video.id = id;
            video.className = "camera_top_style";
            video.controls = true;
            video.playsInline = true;
            video.autoplay = true;
            video["webkit-playsinline"] = true;
            let source = document.createElement('source');
            source.src = this.robotInfo.video.hls;
            source.type = "application/x-mpegURL";
            video.appendChild(source);
            this.$refs[ref].appendChild(video)
        },
        openCamera(val) {
            console.log(`openCamera:${val}`)
            let id = 'envPlayer';
            let name = 'envCamera';
            this._openclose(val, name, id);
        },
        _openclose(val, name, id) {
            let vm = this;
            if (val) {
                if (vm.robotInfo.video.hls === '') {
                    vm.$message({ showClose: true, message: '未检测到播放资源', type: 'error' })
                    setTimeout(function () { vm.camera_switch = false; }, 500)
                    return
                }
                vm.createVideo(name, id);
                vm.myEZPlayer = new EZUIPlayer(id)
            } else {
                if (vm.myEZPlayer) {
                    const video = document.getElementById(id);
                    video && vm.$refs[name].removeChild(video);
                    vm.myEZPlayer.destroy();
                }
            }
        },
        openFarCamera(val) {
            let id = 'farPlayer';
            let name = 'farCamera';
            this._openclose(val, name, id);
        },
        openNearCamera(val) {
            const vm = this;
            if (!(vm.currentMessage.robot && vm.currentMessage.robot.number)) {
                return vm.$message({ showClose: true, message: '该车场无机器人配置', type: 'error' })
            }
            if (val) {
                this.speak2Robot('请您出示有效证件，按屏幕显示拍照，谢谢您的配合')
                const robot = new Robot('certificate', vm.robotInfo.station_id, vm.robotInfo.device_id)
                robot.drawImage().then(res => {
                    if (res.code === 0) {
                        vm.display2Robot(res.content)
                    } else {
                        vm.$message('机器人操作失败，请重试');
                    }
                });
            }
        },
        //发送二维码 操作机器人
        sendQRcodeToScreen() {
        },
        //近景摄像头截图 操作机器人
        nearScreenShot() {
            this.nearScreenShotLoading = true;
            this.sendToScreen('Capture');
        },
        //远景摄像头截图
        farScreenShot() {
            let vm = this;
            let url = `${vm.cfg.url.screenshot}`;
            if (!vm.robotInfo.video.deviceSerial) {
                return
            }
            let data = { deviceSerial: vm.robotInfo.video.deviceSerial }; //摄像头编码
            vm.farScreenShotLoading = true;
            utils.fetch(url, { method: 'POST', body: data }).then((res) => {
                if (res.code == 0) {
                    vm.farImages = [...vm.farImages, res.content.picUrl];
                    if (vm.farImages.length >= vm.cfg.camera_img_limit) {
                        let index = vm.farImages.length - vm.cfg.camera_img_limit;
                        vm.farImages.splice(0, index)
                    }
                } else {
                    vm.$message({ showClose: true, message: res.message, type: 'error' })
                }
                vm.farScreenShotLoading = false;
            });
        },
        delCameraImg(index, arr) {
            let vm = this;
            vm[arr].splice(index, 1);
            if (arr === 'nearImages') {
                if (vm[arr].length === 0) {
                    vm.currentNearImg = ''
                }
            }
        },
        //发送信息到显示屏
        sendInfo2Screen() { },
        //显示缴费限制
        showPayLimits() {

        },
        //正常放行
        openHandler(type) {
            let vm = this;
            if (!vm.robotInfo.device_id) {
                return this.$message({ showClose: true, message: '缺少道闸信息', type: 'error' })
            }
            if (!vm.robotInfo.station_id) {
                return this.$message({ showClose: true, message: '缺少停车场信息', type: 'error' })
            }
            if (!vm.robotInfo.seat_id) {
                return this.$message({ showClose: true, message: '缺少坐席号', type: 'error' })
            }
            vm.setInOutType(); //get inoutType
            let data = {
                device_id: vm.robotInfo.device_id,
                station_id: vm.robotInfo.station_id,
                seat: vm.robotInfo.seat_id,
                reason: vm.carData.reason,
                source: 'custom',
                plate: vm.carData.plate || '', // 选 无牌车就为空
                // client_id: vm.user.user_id, //选
            };
            if (vm.inoutType === 'in_temp_pay') {
                if (!vm.tempSheet.remark || !vm.tempSheet.mobile) {
                    vm.$message({ showClose: true, message: '原因或者手机号不能为空', type: 'error' });
                    return;
                } else {
                    if (!utils.isMobile(vm.tempSheet.mobile)) {
                        vm.$message({ showClose: true, message: '手机号格式不正确', type: 'error' });
                        return;
                    }
                    data.mobile = vm.tempSheet.mobile;
                }
                data.remark = vm.tempSheet.remark;
            }
            console.log(data);
            vm._open(data, type);
        },
        //异常放行
        exceptionOpenHandler() {
            let vm = this;
            if (!vm.robotInfo.device_id) {
                return this.$message({ showClose: true, message: '缺少道闸信息', type: 'error' })
            }
            if (!vm.robotInfo.station_id) {
                return this.$message({ showClose: true, message: '缺少停车场信息', type: 'error' })
            }
            vm.setInOutType(); //get inoutType
            let data = {
                device_id: vm.robotInfo.device_id,
                station_id: vm.robotInfo.station_id,
                seat: vm.robotInfo.seat_id,
                source: 'custom',
                plate: vm.carData.plate
            }
            let arrs = ['out_temp_pay', 'out_noplate', 'out_exception']; //'in_exception'进场异常 有无这种情况？
            //'in_temp'  'in_noplate' 也有异常开闸  但不需要图片
            let type = vm.inoutType;
            console.log(type)
            if (arrs.includes(type)) {
                if (vm.farImages.length === 0 && vm.nearImages.length === 0) {
                    vm.$message({ showClose: true, message: '远景或近景必须至少要有一张图片', type: 'error' });
                    return;
                }
                data.image = [...vm.farImages, ...vm.nearImages];
            }
            data.reason = vm.excepteForm.reason;//默认有值，不必判断
            if (type === 'out_temp_pay' || type === 'in_temp_pay') {
                if (vm.excepteForm.mark === '') {
                    vm.$message({ showClose: true, message: '备注不能为空', type: 'error' });
                    return;
                }
            }
            data.remark = vm.excepteForm.mark;
            vm._open(data, 'exception');
        },
        //开闸操作
        _open(data, type) {
            let vm = this;
            // let typeArr = ['in_temp','in_month','in_overdue','in_overdue_in3days','in_position_occup','in_noplate','in_exception','forbidden_in','out_temp','out_month','out_overdue','out_overdue_in3days','out_position_occup','out_noplate','out_exception'];
            this.$msgbox({
                title: '提示',
                message: '确定要放行?',
                showCancelButton: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: function (action, instance, done) {
                    if (action === 'confirm') {
                        vm._confirmOpen(data, type)
                        done();
                    } else {
                        done();
                    }
                }
            }).catch(e => { console.log(e) });
        },
        _confirmOpen(data, _type) {
            let vm = this;
            let typeArr = ['in_noplate', 'in_temp', 'out_temp', 'out_noplate', 'out_exception']
            //'in_exception' 进场异常 有无这种情况？
            let type = vm.inoutType;
            let btnType = !typeArr.includes(type) ? 'openBtn' : 'exceptionOpenBtn';
            let url = `${vm.cfg.url.openDevice}`;
            utils.fetch(url, { method: 'POST', body: data }).then((res) => {
                if (typeof (res) != 'undefined') {
                    if (res.code === 0) {
                        vm.openGateVoice(_type)
                        vm.$message({ showClose: true, message: '开闸成功', type: 'success' })
                        vm[btnType] = true;
                        if (type === 'in_temp') { //进场普通临停 异常开闸情况 'in_temp'有点特殊 2个按钮要禁用
                            vm.openBtn = true;
                        }
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }

                }
            })
        },
        openGateVoice(type) {
            const vm = this;
            /**
             * 语音播报
             */
            if (!(vm.currentMessage.robot && vm.currentMessage.robot.number)) {
                return this.$message({ showClose: true, message: '该车场无机器人配置', type: 'error' });
            }
            if (!vm.robotInfo.device_id) {
                return this.$message({ showClose: true, message: '缺少道闸信息', type: 'error' })
            }
            if (!vm.robotInfo.station_id) {
                return this.$message({ showClose: true, message: '缺少停车场信息', type: 'error' })
            }
            const robot = new Robot(vm.inoutType, vm.robotInfo.station_id, vm.robotInfo.device_id, true);
            if (type === 'share') {
                // 共享车位被占，占位车辆数组
                robot._shareList = vm.carData.instation_plates.split(',');
            } else if (type === 'monthOverdue') {
                // 过期月卡车辆车牌号
                robot._plate = vm.carData.plate;
                robot._handleType = 2
            } else if (type === 'exception') {
                return
            }
            const loading = this.$loading();
            robot.drawImage().then(res => {
                if (res.code === 0) {
                    const say = robot.say;
                    let sayContent = '';
                    if (Array.isArray(say)) {
                        // 过期月卡车辆车牌号
                        if (type === 'monthOverdue') {
                            sayContent = say[0]
                        } else {
                            sayContent = say[1]
                        }
                    } else {
                        sayContent = say;
                    }
                    vm.speak2Robot(sayContent);
                    vm.display2Robot(res.content);
                    vm.$message({ type: 'success', message: '操作成功' });
                    vm.robotScrrenImg = res.content;
                    vm.changeColor2Robot('green');
                } else {
                    vm.$message('操作失败，请重试');
                }
                loading.close();
            });
        },
        //设置各种进出场 场景 jiangchao
        setInOutType() {
            let vm = this;
            let type = vm.direction === 'in' ? 'in' : 'out';
            if (vm.carData.isMonth === 'N' && vm.carData.reason === 'temp') {
                vm.inoutType = vm.payInfo.status === 'Y' ? `${type}_temp_paid` : `${type}_temp_pay`; // '普通临停进出场',
                return
            }
            if (vm.carData.reason === 'noplate') {
                vm.inoutType = `${type}_noplate`; // '无牌车进出场',
                return
            }
            if (vm.carData.isMonth === 'Y') {
                vm.inoutType = `${type}_month`; // '有效月卡进出场',
                if (vm.carData.is_expired === 'Y') { //过期
                    if (vm.overdue_temp) {
                        vm.inoutType = `${type}_overdue`; // '月卡过期超过3天进出场',
                    } else {
                        vm.inoutType = `${type}_overdue_in3days`; // '月卡过期3天内进出场',
                    }
                } else { //没过期
                    if (vm.carData.reason === 'position_occup') {
                        vm.inoutType = `${type}_position_occup`; // '车位被占进出场',
                    }
                }
                return;
            }
            vm.inoutType = `${type}_exception`; // '异常进出场',特殊人员 车辆 非机动车
        },
        /**
         * 操作显示屏显示，并语音播报
         * type 'temp': 临停, 否则为月卡
         *  
         */
        handleRobot(type) {
            const vm = this;
            if (!(vm.currentMessage.robot && vm.currentMessage.robot.number)) {
                return this.$message({ showClose: true, message: '该车场无机器人配置', type: 'error' });
            }
            if (!vm.robotInfo.device_id) {
                return this.$message({ showClose: true, message: '缺少道闸信息', type: 'error' })
            }
            if (!vm.robotInfo.station_id) {
                return this.$message({ showClose: true, message: '缺少停车场信息', type: 'error' })
            }
            vm.setInOutType();
            const robot = new Robot(vm.inoutType, vm.robotInfo.station_id, vm.robotInfo.device_id);
            switch (vm.inoutType) {
                case 'in_overdue':
                    robot._plate = vm.carData.plate;
                    robot._showType = 'month';
                    break;
                case 'out_overdue':
                    robot._plate = vm.carData.plate;
                    if (type === 'temp') {
                        robot._showType = 'temp';
                    } else {
                        robot._showType = 'month';
                    }
                    break;
                case 'in_position_occup':
                    robot._shareList = vm.carData.instation_plates.split(',');
                    break;
                case 'out_temp_pay':
                    robot._plate = vm.carData.plate;
                    robot._showType = 'temp';
                    break;
                default:
                    break;
            }
            const loading = this.$loading();
            robot.drawImage().then(res => {
                if (res.code === 0) {
                    const say = robot.say;
                    let sayContent = '';
                    if (Array.isArray(say)) {
                        // 过期月卡车辆车牌号
                        if (type === 'monthOverdue') {
                            sayContent = say[0]
                        } else {
                            sayContent = say[1]
                        }
                    } else {
                        sayContent = say;
                    }
                    vm.speak2Robot(sayContent);
                    vm.display2Robot(res.content);
                    vm.changeColor2Robot('green');
                    vm.$message({ type: 'success', message: '操作成功' });
                    vm.robotScrrenImg = res.content
                } else {
                    vm.$message('操作失败，请重试');
                }
                loading.close();
            });
        },
        //操作机器人 语音播报 jiangchao
        speak2Robot(speakcontent) {
            console.log(`---语音播报内容：${speakcontent}---`, this.robotInfo)
            let vm = this;
            if (!(vm.currentMessage.robot && vm.currentMessage.robot.number)) {
                return this.$message({ showClose: true, message: '该车场无机器人配置', type: 'error' });
            }
            if (!vm.robotInfo.station_id) {
                return this.$message({ showClose: true, message: '缺少停车场信息', type: 'error' })
            }
            if (!vm.robotInfo.extcode) {
                return this.$message({ showClose: true, message: '缺少机器人编码', type: 'error' })
            }
            let url = vm.cfg.url.control;
            let data = {
                mid: vm.robotInfo.extcode, //机器人编码
                station_id: vm.robotInfo.station_id, //停车场id
                type: 'Speak',
                speakcontent,
            };
            utils.fetch(url, { method: 'POST', body: data }).then(res => {
                if (typeof (res) != 'undefined') {
                    if (res.code === 0) {
                        console.log('语音播报成功')
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        display2Robot(show, clearRobot) { // 操作机器人 机器人显示场景
            const vm = this;
            if (!(vm.currentMessage.robot && vm.currentMessage.robot.number)) {
                return this.$message({ showClose: true, message: '该车场无机器人配置', type: 'error' });
            }
            if (!vm.robotInfo.extcode) {
                return this.$message({ showClose: true, message: '缺少机器人编码', type: 'error' })
            }
            if (!vm.robotInfo.station_id) {
                return this.$message({ showClose: true, message: '缺少停车场信息', type: 'error' })
            }
            const url = vm.cfg.url.control;
            const data = {
                mid: vm.robotInfo.extcode, //机器人编码
                station_id: vm.robotInfo.station_id, //停车场id
                type: 'Display',
                scene: 'init',
                bg: show
            };
            utils.fetch(url, { method: 'POST', body: data }).then(res => {
                if (clearRobot) {
                    this.robotInfo = { extcode: '', mobile: '', number: '', station_name: '__', device_name: '__', station_id: '', device_id: '', seat_id: '', video: { deviceSerial: '', hls: '', hlsHd: '' } };
                }
                if (typeof (res) != 'undefined') {
                    if (res.code === 0) {
                        console.log('显示成功')
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        // 控制机器人颜色
        changeColor2Robot(color) {
            const vm = this;
            if (!(vm.currentMessage.robot && vm.currentMessage.robot.number)) {
                return this.$message({ showClose: true, message: '该车场无机器人配置', type: 'error' });
            }
            if (!vm.robotInfo.extcode) {
                return this.$message({ showClose: true, message: '缺少机器人编码', type: 'error' })
            }
            if (!vm.robotInfo.station_id) {
                return this.$message({ showClose: true, message: '缺少停车场信息', type: 'error' })
            }
            const url = vm.cfg.url.control;
            const data = {
                color,
                mid: vm.robotInfo.extcode, //机器人编码
                station_id: vm.robotInfo.station_id, //停车场id
                type: 'ChangeColor' //'Restart','Speak','Display','ChangeColor','HangUp','Capture'
            };
            return utils.fetch(url, { method: 'POST', body: data }).then(res => {
                if (typeof (res) != 'undefined') {
                    if (res.code === 0) {
                        console.log('显示成功')
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }

                }
            })
        },
        //操作机器人
        sendToScreen(type) {
            let vm = this;
            if (!(this.currentMessage.robot && this.currentMessage.robot.number)) {
                return this.$message({ showClose: true, message: '该车场无机器人配置', type: 'error' });
            }
            let url = vm.cfg.url.control;
            if (!(vm.robotInfo.station_id && vm.robotInfo.extcode)) {
                return
            }
            let data = {
                mid: vm.robotInfo.extcode, //机器人编码
                station_id: vm.robotInfo.station_id, //停车场id
                type //'Restart','Speak','Display','ChangeColor','HangUp','Capture'
            };

            return utils.fetch(url, { method: 'POST', body: data }).then(res => {
                if (typeof (res) != 'undefined') {
                    if (res.code === 0) {
                        vm.pollCaptureImage(res.content.captureid)
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }

                }
            })
        },
        /**
         * 由于机器人拍照上传不是实时的，后台无法监控，前台采用轮询处理，3秒一次
         */
        pollCaptureImage(captureid) {
            const vm = this;
            const captureInterval = setInterval(() => {
                this.getCaptureImage(captureid).then(res => {
                    if (res.code === 0) {
                        clearInterval(captureInterval);
                        this.pollImgReturn(res.content.captureurl).then(imgPath => {
                            vm.currentNearImg = imgPath;
                            vm.nearImages = [...vm.nearImages, imgPath];
                            if (vm.nearImages.length >= vm.cfg.camera_img_limit) {
                                let index = vm.nearImages.length - vm.cfg.camera_img_limit;
                                vm.nearImages.splice(0, index)
                            }
                            this.nearScreenShotLoading = false;
                        })
                    }
                })
            }, 3000)
        },
        isHasImg(imgPath) {
            const imgObj = new Image()
            imgObj.src = imgPath
            if (imgObj.fileSize > 0 || (imgObj.width > 0 && imgObj.height > 0)) {
                return true
            } else {
                return false
            }
        },
        /**
         * 由于机器人返回图片地址时，图片并不是已经上传成功，所以需要轮询判断图片是否上传成功，2s每次
         */
        pollImgReturn(imgPath) {
            return new Promise((resolve, reject) => {
                const imgInterval = setInterval(() => {
                    if (this.isHasImg(imgPath)) {
                        clearInterval(imgInterval)
                        resolve(imgPath)
                    }
                }, 2000)
            })
        },
        /**
         * 根据captureId获取图片地址
         */
        getCaptureImage(captureid) {
            return utils.fetch(`/custom/getCapture?captureid=${captureid}`).then(res => Promise.resolve(res))
        },
        //操作机器人 语音播报 jiangchao
        //关单操作
        closeSheet() {
            const vm = this;
            // 关闭环境摄像头
            const { station_id, device_id } = vm.robotInfo
            this.clearAll();
            this.openCamera(false)
            // 机器人初始化
            if (!station_id || !device_id) {
                return
            }
            const robot = new Robot('init', station_id, device_id);
            robot.drawImage().then(res => {
                if (res.code === 0) {
                    vm.display2Robot(res.content, true)
                    this.$router.go();
                } else {
                    vm.$message('机器人操作失败，请重试');
                }
            });
        },
        clearAll() {
            this.roadId = '';
            this.roadList = [];
            this.selectStation = '';
            this.direction = '';
            this.initmonthData();
            this.payInfo = { arrive: '__', parktime: '__', status: 'N', total: 0, free: 0, money: 0, tnum: '' };
            this.excepteForm = { reason: '', mark: '' };
            this.tempSheet = { reason: '', mobile: '' };
            this.excepteForm = { reason: 'specail_car', mark: '' };
            this.matchCarArr = [];
            this.farImages = [];
            this.nearImages = [];
            this.isBlurMatch = false;
            this.isShared = false;
            this.camera_switch = false;
            this.camera_far_switch = false;
            this.camera_near_switch = false;
            this.overdue_temp = false;
            this.current_device_image = '';
            this.can_input_plate = true;
            this.true_plate = '';
            this.true_phone = '';
            this.openBtn = false;
            this.exceptionOpenBtn = false;
            this.robotScrrenImg = '';
            this.currentNearImg = '';
            this.currentImgPreview = 1;
            this.excepteForm.mark = '';
            this.farImages = [];
            this.nearImages = [];
            this.openFarCamera(false);
            this.openCamera(false)//关闭环境摄像头
        },
        imgshow(type, index) {
            let arr = type === 'far' ? this.farImages : this.nearImages;
            let images = arr.map((item, index) => {
                return { href: item, title: '截图' + (index + 1) }
            })
            this.images = { show: true, lists: [...images] };
            this.currentImgPreview = Number(index);
        },
        imgClose: function () {
            this.images = { show: false, lists: [] };
        },
    },
    beforeRouteEnter: function (to, from, next) {
        next(function (vm) {

        });
    },
    beforeRouteLeave: function (to, from, next) {
        next();
    },
    beforeDestroy() {

    },
    activated() {
        console.log('server');
        //console.log(this.websock)
        if (this.websock && this.websock.readyState === 3) {
            this.initWebSocket()
        }
        /**
         * 根据坐席号去设置机器人数据
         */
        const { params } = this.$route;
        if (JSON.stringify(params) != '{}') {
            this.setRobotData(params) //坐席号匹配了再设置页面信息
            this.init();
        }
    },
    deactivated() {
        // this.closewebsocket()
        console.log('deactivated')
    }
}
</script>
<style scoped>
.camerabg img {
    width: 100%;
    height: 100%;
}
.bg-none {
    background: none;
}
</style>
