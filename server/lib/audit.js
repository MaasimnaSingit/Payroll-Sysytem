function safeJson(v){ try { return v==null ? null : JSON.stringify(v); } catch { return null; } }
function actorOf(req){
  const u=req.user||{};
  return { actor_user_id: u.uid || null, actor_role: u.role || null };
}
function audit(req, evt){
  try{
    const db=req.app.get('db');
    const row = {
      ...actorOf(req),
      type: evt.type, action: evt.action,
      entity: evt.entity || null, entity_id: evt.entity_id != null ? String(evt.entity_id) : null,
      message: evt.message || null,
      before_json: safeJson(evt.before),
      after_json: safeJson(evt.after),
    };
    db.prepare(`INSERT INTO audit_events(actor_user_id,actor_role,type,action,entity,entity_id,message,before_json,after_json)
                VALUES(@actor_user_id,@actor_role,@type,@action,@entity,@entity_id,@message,@before_json,@after_json)`).run(row);
  }catch(e){ /* non-fatal */ }
}
module.exports = { audit };


