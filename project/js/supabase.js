// ── Supabase client ───────────────────────────────────────────────────────────
// Uses @supabase/supabase-js loaded from CDN (window.supabase)
// ─────────────────────────────────────────────────────────────────────────────

const _sb = window.supabase.createClient(
  'https://nmvlwwtovfoookpmtnmx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdmx3d3RvdmZvb29rcG10bm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MTcxNzcsImV4cCI6MjA5MTM5MzE3N30.4Ou0539banMOKTZmtAD8j_ZUo3kWpjzn49sDZpCrhuI'
);

// ── Mappers ───────────────────────────────────────────────────────────────────

function _mapClient(row) {
  return {
    id:       row.id,
    phone:    row.phone || '',
    name:     row.name  || '',
    email:    row.email || '',
    vehicles: (row.vehicles || []).map(v => ({
      id:    v.id,
      brand: v.make  || '',
      model: v.model || '',
      plate: v.plate || '',
      vin:   v.vin   || '',
    })),
  };
}

function _mapVisit(row) {
  const v = row.vehicles || {};
  const c = v.clients   || {};
  return {
    _id:        row.id,
    _vehicleId: row.vehicle_id,
    date:       new Date(row.date + 'T00:00:00'),
    start:      (row.time_from || '08:00').slice(0, 5),
    end:        (row.time_to   || '09:00').slice(0, 5),
    name:       [v.make, v.model].filter(Boolean).join(' ') || '—',
    phone:      c.phone || '',
    desc:       row.description || '',
    stanowisko: row.stanowisko  || 'Mechanika i usterki',
  };
}

// ── Load all clients ──────────────────────────────────────────────────────────

async function sbLoadClients() {
  const { data, error } = await _sb
    .from('clients')
    .select('id, name, phone, email, vehicles(id, make, model, plate, vin)')
    .order('name');
  if (error) { console.error('sbLoadClients:', error); return []; }
  return data.map(_mapClient);
}

// ── Load visits for date range (YYYY-MM-DD strings) ───────────────────────────

async function sbLoadVisits(dateFrom, dateTo) {
  const { data, error } = await _sb
    .from('visits')
    .select(`
      id, vehicle_id, date, time_from, time_to, description, stanowisko, status,
      vehicles(make, model, plate, vin, clients(name, phone))
    `)
    .gte('date', dateFrom)
    .lte('date', dateTo)
    .order('date')
    .order('time_from');
  if (error) { console.error('sbLoadVisits:', error); return []; }
  return data.map(_mapVisit);
}

// ── Create client ─────────────────────────────────────────────────────────────

async function sbCreateClient(phone, name, email) {
  const { data, error } = await _sb
    .from('clients')
    .insert({ phone, name: name || '—', email: email || null })
    .select('id, name, phone, email')
    .single();
  if (error) throw error;
  return data;
}

// ── Create vehicle ────────────────────────────────────────────────────────────

async function sbCreateVehicle(clientId, brand, model, plate, vin) {
  const { data, error } = await _sb
    .from('vehicles')
    .insert({
      client_id: clientId,
      make:  brand || '',
      model: model || '',
      plate: plate || null,
      vin:   vin   || null,
    })
    .select('id, make, model, plate, vin')
    .single();
  if (error) throw error;
  return data;
}

// ── Create visit ──────────────────────────────────────────────────────────────

async function sbCreateVisit(vehicleId, date, timeFrom, timeTo, description, stanowisko) {
  const dateStr = date.toISOString().slice(0, 10);
  const pad = t => {
    if (!t) return '00:00:00';
    const parts = t.split(':');
    if (parts.length === 2) return t + ':00';
    return t;
  };
  const { data, error } = await _sb
    .from('visits')
    .insert({
      vehicle_id:  vehicleId,
      date:        dateStr,
      time_from:   pad(timeFrom),
      time_to:     pad(timeTo),
      description: description || null,
      stanowisko:  stanowisko  || null,
      status:      'scheduled',
    })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

// ── Update client ─────────────────────────────────────────────────────────────

async function sbUpdateClient(id, phone, name, email) {
  const { error } = await _sb
    .from('clients')
    .update({ phone, name, email: email || null })
    .eq('id', id);
  if (error) console.error('sbUpdateClient:', error);
}

// ── Replace all vehicles for a client ────────────────────────────────────────

async function sbReplaceVehicles(clientId, vehicles) {
  await _sb.from('vehicles').delete().eq('client_id', clientId);
  if (!vehicles.length) return [];
  const rows = vehicles.map(v => ({
    client_id: clientId,
    make:  v.brand || v.make || '',
    model: v.model || '',
    plate: v.plate || null,
    vin:   v.vin   || null,
  }));
  const { data, error } = await _sb.from('vehicles').insert(rows).select('id, make, model, plate, vin');
  if (error) { console.error('sbReplaceVehicles:', error); return []; }
  return data.map(v => ({
    id: v.id, brand: v.make || '', model: v.model || '', plate: v.plate || '', vin: v.vin || '',
  }));
}
