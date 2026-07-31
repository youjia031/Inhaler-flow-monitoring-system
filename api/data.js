// api/data.js — 入口網站後端
import { createClient } from '@supabase/supabase-js';

// 你的 Supabase 設定
const supabaseUrl = 'https://xkuipukvpgglwnonmjbc.supabase.co/rest/v1/';
const supabaseKey = 'sb_publishable_SBtHX0AudJ9f08ZE6SY4hQ_9T1jHKb9';
const supabase = createClient(supabaseUrl, supabaseKey);
const TABLE = 'portal_data';

export default async function handler(req, res) {
    // 記錄請求
    console.log('📝 入口 API 被呼叫');
    console.log('🌐 來源:', req.headers.origin);
    console.log('📦 方法:', req.method);
    console.log('⏰ 時間:', new Date().toISOString());

    // GET：讀取資料
    if (req.method === 'GET') {
        console.log('📖 讀取資料');
        try {
            const { data, error } = await supabase
                .from(TABLE)
                .select('data')
                .order('id', { ascending: true })
                .limit(1);

            if (error) throw error;
            console.log('✅ 讀取成功');
            return res.status(200).json({ 
                success: true, 
                data: data?.[0]?.data || null 
            });
        } catch (error) {
            console.error('❌ 讀取失敗:', error);
            return res.status(500).json({ 
                success: false, 
                message: error.message 
            });
        }
    }

    // POST：儲存資料
    if (req.method === 'POST') {
        console.log('📝 儲存資料');
        console.log('📦 內容:', JSON.stringify(req.body).slice(0, 200) + '...');

        try {
            // 先查詢是否有現有記錄
            const { data: existing } = await supabase
                .from(TABLE)
                .select('id')
                .limit(1);

            let result;
            if (existing && existing.length > 0) {
                // 更新
                result = await supabase
                    .from(TABLE)
                    .update({ data: req.body, updated_at: new Date().toISOString() })
                    .eq('id', existing[0].id);
            } else {
                // 新增
                result = await supabase
                    .from(TABLE)
                    .insert({ data: req.body });
            }

            if (result.error) throw result.error;
            console.log('✅ 儲存成功');
            return res.status(200).json({ 
                success: true, 
                message: 'Data saved successfully' 
            });
        } catch (error) {
            console.error('❌ 儲存失敗:', error);
            return res.status(500).json({ 
                success: false, 
                message: error.message 
            });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}