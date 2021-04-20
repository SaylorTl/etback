<template>
    <div class="charge">
        <el-tabs v-model="type" @tab-click="handleClick">
            <el-tab-pane label="按次收费" name="times" >
                <div class="table box-width">
                  
                        <div class="charge-com-station" >
                          <my-select-station v-model="stationId"  size="small" class="cell widthX150"  placeholder="停车场" ></my-select-station>
                        </div>
                        <div class="charge-add-btn" >
                          <el-button size="small" @click="reset">重置</el-button>
                          <el-button size="small" @click="handleAdd"><i class="fa fa-plus"></i>添加</el-button>
                        </div>
                    
                  
                    <el-table :data="times" v-loading="dataLoading" element-loading-text="拼命加载中" :show-header="showHeader"  border fit>
                        <el-table-column prop="station_name" label="停车场"></el-table-column>
                        <el-table-column label="收费周期">
                          <template slot-scope="scope">
                            <div>{{scope.row.time_type == '0' ? '24点' : '24小时'}}</div>
                          </template>
                        </el-table-column>
                        <el-table-column prop="moneypay" label="当日最高收费金额">
                        </el-table-column>
                        <el-table-column prop="freetime" label="免费时长">
                        </el-table-column>
                       <el-table-column label="操作" width="130" >
                        <template slot-scope="scope">
                          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"><i class="fa fa-credit-card"></i>编辑</el-button>
                          <el-button class="ml0" size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)"><i class="el-icon-delete"></i>删除</el-button>
                        </template>
                        </el-table-column>
                    </el-table>
                  </div>
            </el-tab-pane>
            <el-tab-pane label="按时收费" name="rate">
                <div class='table box-width'>
                    <div class="charge-com-station" >
                        <my-select-station v-model="stationId"  size="small" class="cell widthX150"  placeholder="停车场" ></my-select-station>
                    </div>
                    <div class="charge-add-btn" >
                        <el-button size="small" @click="handleAdd"><i class="fa fa-plus"></i>添加</el-button>
                    </div>
                    <el-table v-loading="dataLoading" :data="rate" border  fit>
                        <el-table-column prop="station_name" label="停车场">
                        </el-table-column>
                        <el-table-column prop="enable_time" label="起始时间">
                        </el-table-column>
                        <el-table-column prop="lower" label="最低收费金额">
                        </el-table-column>
                        <el-table-column prop="upper" label="最高收费金额">
                          </el-table-column>
                        <el-table-column label="车型">
                          <template slot-scope="scope">
                            <div>{{textConfig.model[scope.row.model]}}</div>
                          </template>
                        </el-table-column>
                        <el-table-column label="类型">
                          <template slot-scope="scope">
                            <div>{{textConfig.type[scope.row.type]}}</div>
                          </template>
                        </el-table-column>
                        <el-table-column prop="freetime" label="免费时长"></el-table-column>
                        <el-table-column prop="per_minute" label="收费时间周期"></el-table-column>
                        <el-table-column prop="money" label="收费金额"></el-table-column>
                        <el-table-column prop="rate" label="每分钟收费金额"></el-table-column>
                        <el-table-column label="操作" width="130">
                         <template slot-scope="scope">
                           <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"><i class="fa fa-credit-card"></i>编辑</el-button>
                           <el-button class="ml0" size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)"><i class="el-icon-delete"></i>删除</el-button>
                         </template>
                         </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>
            <el-tab-pane label="按时段收费" name="period">
                <div class='table box-width'>
                    
                          <div class="charge-com-station" >
                            <my-select-station v-model="stationId"  size="small" class="cell widthX150" placeholder="停车场" ></my-select-station>
                          </div>
                          <div class="charge-add-btn" >
                            <el-button size="small" @click="handleAdd"><i class="fa fa-plus"></i>添加</el-button>
                          </div>
                      
                    <el-table v-loading="dataLoading" :data="period" border style="width: 100%">
                        <el-table-column prop="station_name" label="停车场">
                        </el-table-column>
                        <el-table-column prop="before_amount" label="固定金额">
                        </el-table-column>
                        <el-table-column prop="before_time" label="固定时长">
                        </el-table-column>
                        <el-table-column label="车型">
                          <template slot-scope="scope">
                            <div>{{textConfig.model[scope.row.model]}}</div>
                          </template>
                        </el-table-column>
                        <el-table-column label="类型">
                          <template slot-scope="scope">
                            <div>{{textConfig.type[scope.row.type]}}</div>
                          </template>
                        </el-table-column>
                        <el-table-column prop="day_period" label="白天时段">
                        </el-table-column>
                        <el-table-column prop="day_amount" label="白天收费金额">
                        </el-table-column>
                        <el-table-column prop="freetime" label="免费时长">
                        </el-table-column>
                        <el-table-column prop="moneypay" label="最高收费">
                        </el-table-column>
                        <el-table-column prop="night_period" label="夜间时段">
                        </el-table-column>
                        <el-table-column prop="night_amount" label="夜间收费金额">
                        </el-table-column>
                        <el-table-column label="操作" width="130">
                         <template slot-scope="scope">
                           <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"><i class="fa fa-credit-card"></i>编辑</el-button>
                           <el-button class="ml0" size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)"><i class="el-icon-delete"></i>删除</el-button>
                         </template>
                         </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>
            <el-tab-pane label="按梯次收费" name="duration">
                <div class='table box-width'>
                  
                        <div class="charge-com-station" >
                          <my-select-station v-model="stationId"  size="small" class="cell widthX150"  placeholder="停车场" ></my-select-station>
                        </div>
                        <div class="charge-add-btn" >
                          <el-button size="small" @click="handleAdd"><i class="fa fa-plus"></i>添加</el-button>
                        </div>
                   
                    <el-table v-loading="dataLoading" :data="duration" border class="widthP100" >
                        <el-table-column prop="station_name" label="停车场"></el-table-column>
                        <el-table-column prop="moneypay" label="当日最高收费金额"></el-table-column>
                        <el-table-column prop="freetime" label="免费时长"></el-table-column>
                        <el-table-column label="车型">
                          <template slot-scope="scope">
                            <div>{{textConfig.model[scope.row.model]}}</div>
                          </template>
                        </el-table-column>
                        <el-table-column label="类型">
                          <template slot-scope="scope">
                            <div>{{textConfig.type[scope.row.type]}}</div>
                          </template>
                        </el-table-column>
                        <el-table-column prop="N1" label="N1"></el-table-column>
                        <el-table-column prop="N2" label="N2"></el-table-column>
                        <el-table-column prop="N3" label="N3"></el-table-column>
                        <el-table-column prop="N4" label="N4"></el-table-column>
                        <el-table-column prop="N5" label="N5"></el-table-column>
                        <el-table-column prop="N6" label="N6"></el-table-column>
                        <el-table-column prop="N7" label="N7"></el-table-column>
                        <el-table-column prop="N8" label="N8"></el-table-column>
                        <el-table-column prop="N9" label="N9"></el-table-column>
                        <el-table-column prop="N10" label="N10"></el-table-column>
                        <el-table-column prop="N11" label="N11"></el-table-column>
                        <el-table-column prop="N12" label="N12"></el-table-column>
                        <el-table-column prop="N13" label="N13"></el-table-column>
                        <el-table-column prop="N14" label="N14"></el-table-column>
                        <el-table-column prop="N15" label="N15"></el-table-column>
                        <el-table-column prop="N16" label="N16"></el-table-column>
                        <el-table-column prop="N17" label="N17"></el-table-column>
                        <el-table-column prop="N18" label="N18"></el-table-column>
                        <el-table-column prop="N19" label="N19"></el-table-column>
                        <el-table-column prop="N20" label="N20"></el-table-column>
                        <el-table-column prop="N21" label="N21"></el-table-column>
                        <el-table-column prop="N22" label="N22"></el-table-column>
                        <el-table-column prop="N23" label="N23"></el-table-column>
                        <el-table-column prop="N24" label="N24"></el-table-column>
                        <el-table-column label="操作" width="130" align="center">
                         <template slot-scope="scope">
                           <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"><i class="fa fa-credit-card"></i>编辑</el-button>
                           <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)"><i class="el-icon-delete"></i>删除</el-button>
                         </template>
                         </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>
        </el-tabs>
        
        <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>   
          <!-- <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20]"
            :page-size="20"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination> -->
        
        <el-dialog title="编辑按次收费" :visible.sync="charge.times.show" @close="dialogClose">
          <el-form ref="timesRate"  :rules="charge.times.rules" :model="charge.times.form" label-width="140px">
            <el-form-item label="停车场" prop="station">
              <my-select-station v-model="charge.times.form.station"   class="cell widthP100" ></my-select-station>
            </el-form-item>
            <el-form-item label="收费周期"  prop="time_type">
              <el-select  v-model="charge.times.form.time_type" placeholder="选择收费周期" class="widthP100">
                <el-option label="24点" value="0"></el-option>
                <el-option label="24小时" value="1"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="当日最高收费金额" prop="moneypay">
              <el-input v-model="charge.times.form.moneypay"  type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="免费时长"  prop="freetime">
              <el-input v-model="charge.times.form.freetime"  type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button @click="editSubmit" type="primary" size="small">保存</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
        <el-dialog title="编辑按时收费" :visible.sync="charge.rate.show" @close="dialogClose">
          <el-form ref="rateRate"  :rules="charge.rate.rules" :model="charge.rate.form" label-width="120px">
            <el-form-item label="停车场" prop="station">
              <my-select-station v-model="charge.rate.form.station"  class="cell widthP100" ></my-select-station>
            </el-form-item>
            <el-form-item label="起始时间" prop="enable_time">
              <el-input v-model="charge.rate.form.enable_time"  type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="收费周期" prop="time_type">
              <el-select  v-model="charge.rate.form.time_type" placeholder="选择收费周期" class="widthP100">
                <el-option label="24点" value="0"></el-option>
                <el-option label="24小时" value="1"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="收费方式" prop="is_repeat">
              <el-select  v-model="charge.rate.form.is_repeat" placeholder="选择收费方式" class="widthP100">
                <el-option label="重复收费" value="Y"></el-option>
                <el-option label="不重复收费" value="N"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="最低收费金额" prop="lower">
              <el-input v-model="charge.rate.form.lower"  type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="最高收费金额" prop="upper">
              <el-input v-model="charge.rate.form.upper"  type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="车型" prop="model">
              <el-select  v-model="charge.rate.form.model" placeholder="请选择车型" class="widthP100">
                <el-option v-for="item in textConfig.models" :label="item.name" :value="item.value" :key="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="类型" prop="type">
              <el-select  v-model="charge.rate.form.type" placeholder="请选择类型" class="widthP100">
                <el-option v-for="item in textConfig.types" :label="item.name" :value="item.value" :key="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="免费时长" prop="freetime">
              <el-input v-model="charge.rate.form.freetime"  type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="收费时间周期" prop="per_minute">
              <el-input v-model="charge.rate.form.per_minute"  type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="收费金额" prop="money">
              <el-input v-model="charge.rate.form.money" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
             <!-- <el-form-item label="每分钟收费金额"  label-width="120px">
              <el-input v-model="charge.rate.form.rate" auto-complete="off"></el-input>
            </el-form-item> -->
            <el-form-item>
                <el-button @click="editSubmit" type="primary" size="small">保存</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
        <el-dialog title="编辑按时段收费" :visible.sync="charge.period.show" @close="dialogClose">
          <el-form ref="periodRate"  :rules="charge.period.rules" :model="charge.period.form" label-width="120px">
            <el-form-item label="停车场" prop="station">
              <my-select-station v-model="charge.period.form.station"    class="cell widthP100" ></my-select-station>
            </el-form-item>
            <el-form-item label="固定金额" prop="before_amount">
              <el-input v-model="charge.period.form.before_amount" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="固定时长" prop="before_time">
              <el-input v-model="charge.period.form.before_time" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="车型" prop="model">
              <el-select  v-model="charge.period.form.model" placeholder="请选择车型" class="widthP100">
                <el-option v-for="item in textConfig.models" :label="item.name" :value="item.value" :key="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="类型" prop="type">
              <el-select  v-model="charge.rate.form.model" placeholder="请选择类型" class="widthP100">
                <el-option v-for="item in textConfig.types" :label="item.name" :value="item.value" :key="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="白天时段" prop="daytime">
              <el-time-picker
                v-model="timePicker.daytime_begin"
                :picker-options="{
                  selectableRange: '00:00:00 - 23:59:59'
                }"
                style="width:50%;float:left;"
                placeholder="开始时间">
              </el-time-picker>
              <el-time-picker
                v-model="timePicker.daytime_end"
                :picker-options="{
                  selectableRange: '00:00:00 - 23:59:59'
                }"
                style="width:50%;float:left;"
                placeholder="结束时间">
              </el-time-picker>
              <!-- <el-input v-model="charge.period.form.daytime_begin" auto-complete="off"></el-input> -->
            </el-form-item>
            <el-form-item label="白天收费金额" prop="day_amount">
              <el-input v-model="charge.period.form.day_amount" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="夜晚时段" prop="nighttime">
              <el-time-picker
                v-model="timePicker.nighttime_begin"
                :picker-options="{
                  selectableRange: '00:00:00 - 23:59:59'
                }"
                style="width:50%;float:left;"
                placeholder="开始时间">
              </el-time-picker>
              <el-time-picker
                v-model="timePicker.nighttime_end"
                :picker-options="{
                  selectableRange: '00:00:00 - 23:59:59'
                }"
                style="width:50%;float:left;"
                placeholder="结束时间">
              </el-time-picker>
            </el-form-item>
            <el-form-item label="夜晚收费金额" prop="night_amount">
              <el-input v-model="charge.period.form.night_amount" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
             <el-form-item label="免费时长" prop="freetime">
              <el-input v-model="charge.period.form.freetime" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="最高收费" prop="moneypay">
              <el-input v-model="charge.period.form.moneypay" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button @click="editSubmit" type="primary" size="small">保存</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
        <el-dialog title="编辑按梯次收费" :visible.sync="charge.duration.show" @close="dialogClose">
          <el-form ref="durationRate"  :rules="charge.duration.rules" :model="charge.duration.form" label-width="120px">
            <el-form-item label="停车场" prop="station">
              <my-select-station v-model="charge.duration.form.station"   class="cell widthP100" ></my-select-station>
            </el-form-item>
            <el-form-item label="当日最高收费金额" prop="moneypay">
              <el-input v-model="charge.duration.form.moneypay" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="车型" prop="model">
              <el-select  v-model="charge.duration.form.model" placeholder="请选择车型" class="widthP100">
                <el-option v-for="item in textConfig.models" :label="item.name" :value="item.value" :key="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="类型" prop="type">
              <el-select  v-model="charge.duration.form.type" placeholder="请选择类型" class="widthP100">
                <el-option v-for="item in textConfig.types" :label="item.name" :value="item.value" :key="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="免费时长" prop="freetime">
              <el-input v-model="charge.duration.form.freetime" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N1" prop="N1">
              <el-input v-model="charge.duration.form.N1" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N2" prop="N2">
              <el-input v-model="charge.duration.form.N2" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N3" prop="N3">
              <el-input v-model="charge.duration.form.N3" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N4" prop="N4">
              <el-input v-model="charge.duration.form.N4" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N5" prop="N5">
              <el-input v-model="charge.duration.form.N5" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N6" prop="N6">
              <el-input v-model="charge.duration.form.N6" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N7" prop="N7">
              <el-input v-model="charge.duration.form.N7" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N8" prop="N8">
              <el-input v-model="charge.duration.form.N8" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N9" prop="N9">
              <el-input v-model="charge.duration.form.N9" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N10" prop="N10">
              <el-input v-model="charge.duration.form.N10" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N11" prop="N11">
              <el-input v-model="charge.duration.form.N11" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N12" prop="N12">
              <el-input v-model="charge.duration.form.N12" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N13" prop="N13">
              <el-input v-model="charge.duration.form.N13" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N14" prop="N14">
              <el-input v-model="charge.duration.form.N14" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N15" prop="N15">
              <el-input v-model="charge.duration.form.N15" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N16" prop="N16">
              <el-input v-model="charge.duration.form.N16" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N17" prop="N17">
              <el-input v-model="charge.duration.form.N17" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N18" prop="N18">
              <el-input v-model="charge.duration.form.N18" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N19" prop="N19">
              <el-input v-model="charge.duration.form.N19" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N20" prop="N20">
              <el-input v-model="charge.duration.form.N20" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N21" prop="N21">
              <el-input v-model="charge.duration.form.N21" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N22" prop="N22">
              <el-input v-model="charge.duration.form.N22" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N23" prop="N23">
              <el-input v-model="charge.duration.form.N23" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="N24" prop="N24">
              <el-input v-model="charge.duration.form.N24" type="number"  min="0" auto-complete="off"></el-input>
            </el-form-item>
             <el-form-item>
                <el-button @click="editSubmit" type="primary" size="small">保存</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
    </div>
</template>
<script>
import utils from "../../../utils/utils.js";
export default {
  data: function() {
    return {
      showHeader: true,
      type: "times",
      pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
      dataLoading:false,
      charge: {
        times: {
          show: false,
          form: {},
          rules: {
            station: [
              { required: true, message: '请输入停车场', trigger: 'change'}
            ],
            time_type: [
              { required: true, message: '请选择收费周期', trigger: 'blur'}
            ],
            moneypay: [
              { required: true,message: '请输入当日最高收费', trigger: 'blur'}
            ],
            freetime: [
              { required: true,message: '请输入免费时长', trigger: 'blur'}
            ]
          }
        },
        rate: {
          show: false,
          form: {},
          rules: {
            station: [
              { required: true, message: '请输入停车场', trigger: 'change'}
            ],
            enable_time: [
              {required: true, message: '请输入起始时间', trigger: 'blur'}
            ],
            time_type: [
              { required: true, message: '请选择收费周期', trigger: 'blur'}
            ],
            is_repeat: [
              { required: true, message: '请选择收费方式', trigger: 'blur'}
            ],
            lower: [
              {required: true, message: '请输入最低收费金额', trigger: 'blur'}
            ],
            upper: [
              {required: true, message: '请输入最高收费金额', trigger: 'blur'}
            ],
            freetime: [
              {required: true, message: '请输入免费时长', trigger: 'blur'}
            ],
            per_minute: [
              {required: true, message: '请输入收费时间周期', trigger: 'blur'}
            ],
            model: [
              {required: true, message: '请选择车型', trigger: 'blur'}
            ],
            money: [
              {required: true, message: '请输入收费金额', trigger: 'blur'}
            ],
          }
        },
        period: {
          show: false,
          form: {},
          rules: {
            station: [
              {required: true, message: '请输入停车场', trigger: 'change'}
            ],
            before_amount: [
              {required: true, message: '请输入固定金额', trigger: 'blur'}
            ],
            before_time: [
              {required: true, message: '请输入固定时长', trigger: 'blur'}
            ],
            model: [
              {required: true, message: '请输入车型', trigger: 'blur'}
            ],
            daytime_begin: [
              {required: false, message: '请输入白天时段', trigger: 'blur'}
            ],
            daytime_end: [
              {required: false, message: '请输入白天时段', trigger: 'blur'}
            ],
            day_amount: [
              {required: true, message: '请输入白天收费金额', trigger: 'blur'}
            ],
            nighttime_begin: [
              {required: false, message: '请输入夜晚收费金额', trigger: 'blur'}
            ],
            nighttime_end: [
              {required: false, message: '请输入夜晚收费金额', trigger: 'blur'}
            ],
            night_amount: [
              {required: true, message: '请输入收费金额', trigger: 'blur'}
            ],
            freetime: [
              {required: true, message: '请输入免费时长', trigger: 'blur'}
            ],
            moneypay: [
              {required: true, message: '请输入最高收费', trigger: 'blur'}
            ],
          }
        },
        duration: {
          show: false,
          form: {},
          rules: {
            station: [
              {required: true, message: '请输入停车场', trigger: 'change'}
            ],
            moneypay: [
              {required: true, message: '请输入当日最高收费金额', trigger: 'blur'}
            ],
            model: [
              {required: true, message: '请输入车型', trigger: 'blur'}
            ],
            freetime: [
              {required: true, message: '请输入免费时长', trigger: 'blur'}
            ],
            N1: [
              {required: true, message: '请输入N1', trigger: 'blur'}
            ],
            N2: [
              {required: false, message: '请输入N2', trigger: 'blur'}
            ],
            N3: [
              {required: false, message: '请输入N3', trigger: 'blur'}
            ],
            N4: [
              {required: false, message: '请输入N4', trigger: 'blur'}
            ],
            N5: [
              {required: false, message: '请输入N5', trigger: 'blur'}
            ],
            N6: [
              {required: false, message: '请输入N6', trigger: 'blur'}
            ],
            N7: [
              {required: false, message: '请输入N7', trigger: 'blur'}
            ],
            N8: [
              {required: false, message: '请输入N8', trigger: 'blur'}
            ],
            N9: [
              {required: false, message: '请输入N9', trigger: 'blur'}
            ],
            N10: [
              {required: false, message: '请输入N10', trigger: 'blur'}
            ],
            N11: [
              {required: false, message: '请输入N11', trigger: 'blur'}
            ],
            N12: [
              {required: false, message: '请输入N12', trigger: 'blur'}
            ],
            N13: [
              {required: false, message: '请输入N13', trigger: 'blur'}
            ],
            N14: [
              {required: false, message: '请输入N14', trigger: 'blur'}
            ],
            N15: [
              {required: false, message: '请输入N15', trigger: 'blur'}
            ],
            N16: [
              {required: false, message: '请输入N16', trigger: 'blur'}
            ],
            N17: [
              {required: false, message: '请输入N17', trigger: 'blur'}
            ],
            N18: [
              {required: false, message: '请输入N8', trigger: 'blur'}
            ],
            N19: [
              {required: false, message: '请输入N19', trigger: 'blur'}
            ],
            N20: [
              {required: false, message: '请输入N20', trigger: 'blur'}
            ],
            N21: [
              {required: false, message: '请输入N21', trigger: 'blur'}
            ],
            N22: [
              {required: false, message: '请输入N22', trigger: 'blur'}
            ],
            N23: [
              {required: false, message: '请输入N23', trigger: 'blur'}
            ],
            N24: [
              {required: false, message: '请输入N24', trigger: 'blur'}
            ],
          }
        }
      },
      times: [],
      rate: [],
      period: [],
      duration: [],
      currentPage: 1,
      total: 0,
      stationId: "",
      formRules: {

      },
      textConfig: {
        model: {
          small: "小型",
          middle: "中型",
          huge: "大型"
        },
        models: [
          {
            name: "小型",
            value: "small"
          },
          {
            name: "中型",
            value: "middle"
          },
          {
            name: "大型",
            value: "huge"
          }
        ],
        type: {
          normal: '普通',
          owner: '业主'
        },
        types: [
          {
            name: '普通',
            value: 'normal'
          },
          {
            name: '业主',
            value: 'owner'
          }
        ]
      },
      timePicker: {
        daytime_begin: "",
        daytime_end: "",
        nighttime_begin: "",
        nighttime_end: ""
      }
    };
  },
  watch: {
    stationId: function() {
      this.getData();
    }
  },
  mounted: function() {
    this.getData();
  },
  methods: {
    handleClick(tab, event) {
      this.type = tab.name;
      this.currentPage = 1;
      this.pagination = { page: 1, pagesize: 20, total: 0, showTotal: true };
      this.getData();
    },
    reset(){
        //this.stationId = '';
    },
    getData: function() {
      var that = this;
      var param = utils.setQueryString({
        page: that.pagination.page,
        pagesize: 20,
        stationId: that.stationId || ""
      });
      that.dataLoading = true;
      utils.fetch("/" + that.type + "/lists?" + param).then(function(data) {
        that.dataLoading = false;
        if (data.code == 0 && data.content) {
          if (that.type == "period") {
            for (var key in data.content.lists) {
              data.content.lists[key]["day_period"] =
                data.content.lists[key].daytime_begin +
                "-" +
                data.content.lists[key].daytime_end;
              data.content.lists[key]["night_period"] =
                data.content.lists[key].nighttime_begin +
                "-" +
                data.content.lists[key].nighttime_end;
            }
          }
          that[that.type] = data.content.lists;
          that.total = data.content.total;
          that.pagination.total = typeof data != "undefined" && data.code == 0 ? data.content.total : 0;
          utils.setCache(that,['stationId','type',that.type]);
        } else {
          that[that.type] = [];
          that.$message({
            type: "error",
            message: data.message
          });
        }
      });
    },
    // 翻页
    handleSizeChange: function(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange: function(val) {
      this.currentPage = val;
      this.getData();
    },
    setPageData: function (pageObj) {
        this.pagination = pageObj;
        this.getData();
    },
    dialogClose: function() {
      this.form = {};
    },
    timeFormat: function(date) {
      var hours = date.getHours();
      var min = date.getMinutes();
      var sec = date.getSeconds();
      return (
        this.doubleFormat(hours) +
        ":" +
        this.doubleFormat(min) +
        ":" +
        this.doubleFormat(sec)
      );
    },
    doubleFormat: function(time) {
      return time < 10 ? "0" + time : time;
    },
    periodTimeSet: function(param) {
      param.daytime_begin =
        this.timePicker.daytime_begin &&
        this.timeFormat(this.timePicker.daytime_begin);
      param.daytime_end =
        this.timePicker.daytime_end &&
        this.timeFormat(this.timePicker.daytime_end);
      param.nighttime_begin =
        this.timePicker.nighttime_begin &&
        this.timeFormat(this.timePicker.nighttime_begin);
      param.nighttime_end =
        this.timePicker.nighttime_end &&
        this.timeFormat(this.timePicker.nighttime_end);
    },
    timePickerSet: function(row) {
      var arr = [
        "daytime_begin",
        "daytime_end",
        "nighttime_begin",
        "nighttime_end"
      ];
      for (var i = 0; i < arr.length; i++) {
        var times = row[arr[i]].split(":");
        this.timePicker[arr[i]] = new Date(
          null,
          null,
          null,
          times[0],
          times[1],
          times[2]
        );
      }
    },
    editSubmit: function() {
      var that = this;
      if (this.subType == "del") {
        var param = {};
        param.status = 0;
      }else {
        var param = Object.assign({}, this.charge[this.type].form);
        if (that.type == "period") {
          that.periodTimeSet(param);
        }
        var rules = that.charge[that.type].rules;
        for (var rkey in rules) {
          if(!param[rkey]&&param[rkey]!=0){
            var rule = rules[rkey];
            return that.$message({
              type: "error",
              message: rule[0].message
            })
          }
        }
        param.stationId = param.station;
      }
      utils
        .fetch("/" + that.type + "/" + that.subType, {
          method: "post",
          body: param
        })
        .then(function(data) {
          if (data.code == 0) {
            that.getData();
            that.charge[that.type].show = false;
            that.$message({
              type: "success",
              message: data.message
            });
          } else {
            that.$message({
              type: "error",
              message: data.message
            });
          }
        });
    },
    handleAdd: function() {
      this.subType = "add";
      this.charge[this.type].form = {};
      if (this.$refs[this.type + "Rate"]) {
        this.$refs[this.type + "Rate"].resetFields();
      }
      this.charge[this.type].show = true;
    },
    handleEdit: function(index, row) {
      this.subType = "update";
      if (this.type == "period") {
        this.timePickerSet(row);
      }
      if (this.$refs[this.type + "Rate"]) {
        this.$refs[this.type + "Rate"].resetFields();
      }
      this.charge[this.type].form = row;
      this.charge[this.type].show = true;
    },
    handleDelete: function(index, row) {
      var that = this;

      this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          var param = utils.setQueryString({
            id: row.id
          });
          utils.fetch("/" + that.type + "/del?" + param).then(function(data) {
            if (data.code == 0) {
              that.getData();
              that.$message({
                type: "success",
                message: data.message
              });
            } else {
              that.$message({
                type: "error",
                message: data.message
              });
            }
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
  beforeRouteEnter: function (to, from, next) {
        next(function (vm) {
            utils.getTingYunScript();
            var data = utils.getCache();
            var obj = data == '' ? {} : JSON.parse(data);
            if (obj.type) {
                utils.getCacheItem(vm,obj);
            } else {
                vm.getData();
            }
        });
    },
};
</script>
