{
  const crearNodo = (tipoNodo, propert) =>{
    const tipos = {
      'Primal': nodos.Primal,
      'agrupacion': nodos.Agrupacion,
      'binaria': nodos.OperacionBinaria,
      'unaria': nodos.OperacionUnaria,
      'declaracionVariable': nodos.DeclaracionVariable,
      'referenciaVariable': nodos.ReferenciaVariable,
      'print': nodos.Print,
      'expresionStmt': nodos.ExpresionStmt,
      'asignacion': nodos.Asignacion,
      'bloque': nodos.Bloque,
      'if': nodos.If,
      'while': nodos.While,
      'for': nodos.For,
      'break': nodos.Break,
      'continue': nodos.Continue,
      'return': nodos.Return,
      'llamada': nodos.Llamada,
      'dclFunc' : nodos.FuncDcl,
      'switch': nodos.Switch,
      'ternario': nodos.Ternario,
      'embebidas': nodos.Embebidas,
      'declaracionArreglo' : nodos.DeclaracionArreglo,
      'declaracionArregloTam' : nodos.DeclaracionArregloTam,
      'declaracionArregloCopia' : nodos.DeclaracionArregloCopia,
      'accesoArreglo' : nodos.AccesoArreglo,
      'asignacionArreglo' : nodos.AsignacionArreglo,
      'funcionArreglo' : nodos.FuncionArreglo,
      'forEach' : nodos.ForEach
    }

    const nodo = new tipos[tipoNodo](propert)
    nodo.location = location()
    return nodo
  }
}

Start = _ dcl:Sentencias* _ { return dcl }

Sentencias = vdlc:DeclarVar _ { return vdlc }
            / fdlc:DeclarFunc _ { return fdlc }
            / adlc:DeclarArr _ ";" _ { return adlc }
            / ndlc:StmtnDlc _ { return ndlc }

DeclarVar = tipo:TipoDato _ id:Identificador _ "=" _ exp:Expresion _ ";" {return crearNodo('declaracionVariable', { id, exp, tipo })}
          / tipo:"var" _ id:Identificador _ "=" _ exp:Expresion _ ";" {return crearNodo('declaracionVariable', { id, exp, tipo })} // Se infiere el tipo.
          / tipo:TipoDato _ id:Identificador _ exp:";" {return crearNodo('declaracionVariable', { id, tipo })}

TipoDato = td:"int" { return td }
        / td:"float" { return td }
        / td:"string" { return td }
        / td:"bool" { return td }
        / td:"char" { return td }

DeclarArr = tipo:TipoDato _ "[" _ "]" _ id:Identificador _ "=" _ "{" _ lista:ListaExp _ "}" { return crearNodo('declaracionArreglo', { tipo, id, lista }) }
  / tipo:TipoDato _ "[" _ "]" _ id:Identificador _ "=" _ "new" _ tipo2:TipoDato _ "[" _ tam:Expresion _ "]" { return crearNodo('declaracionArregloTam', { tipo, id, tipo2, tam }) }
  / tipo:TipoDato _ "[" _ "]" _ id:Identificador _ "=" _ id2:Identificador { return crearNodo('declaracionArregloCopia', { tipo, id, id2 }) }

DeclarFunc = td:FuncTipoDato _ id:Identificador _ "(" _ params: Parametros? _ ")" _  block:Bloque { return crearNodo('dclFunc', { td,  id, params: params || [], block }) }

Parametros = param:Parametro _ params:("," _ parame:Parametro { return parame })* { return [param, ...params] }

Parametro = tipo:TipoDato _ id:Identificador { return { tipo, id } }

FuncTipoDato = td:"int" { return td }
        / td:"float" { return td }
        / td:"string" { return td }
        / td:"bool" { return td }
        / td:"char" { return td }
        / td:"void" { return td }

StmtnDlc = "System.out.println(" _ exp:Expresion _ ")" _ ";" { return crearNodo('print', { exp }) }
    / block:Bloque { return block }
    / stContr:StmtControl { return stContr }
    / stCicle:StmtCiclos { return stCicle }
    / stTrans:StmtTransferencia { return stTrans }
    / exp:Expresion _ ";" { return crearNodo('expresionStmt', { exp }) }

ListaExp = exp:Expresion _ exps:("," _ expre:Expresion { return expre })* { return [exp, ...exps]; }

Bloque = "{" _ block:Sentencias* _ "}" { return crearNodo('bloque', { block }) }

StmtControl =  "if" _ "(" _ cond:Expresion _ ")" _ iftrue:StmtnDlc iffalse:(
      _ "else" _ iffalse:StmtnDlc { return iffalse }
      )? { return crearNodo('if', { cond, iftrue, iffalse }) }
    /  suich:Switch { return suich }

Switch = "switch" _ "(" _ exp:Expresion _ ")" _ "{" _ cases:Case* defo:Default? _ "}" { return crearNodo('switch', { exp, cases, defo }) }

Case = "case" _ exp:Expresion _ ":" _ stmts:Sentencias* { return { exp, stmts } }

Default = "default" _ ":" _ stmts:Sentencias* { return { stmts } }

StmtCiclos = "while" _ "(" _ cond:Expresion _ ")" _ loop:StmtnDlc { return crearNodo('while', {cond, loop})}
    / "for" _ "(" _ init:ForInit _  cond:Expresion _ ";" _ inc:Expresion _ ")" _ loop:StmtnDlc { return crearNodo('for', {init, cond, inc, loop})}
    / "for" _ "(" _ tipo:TipoDato _ id:Identificador _ ":" _ arr:Identificador _ ")" _ loop:StmtnDlc { return crearNodo('forEach', {tipo, id, arr, loop}) }

ForInit = dcl:DeclarVar { return dcl }
        / exp:Expresion _ ";" { return exp }

StmtTransferencia = "break" _ ";" { return crearNodo('break') }
    / "continue" _ ";" { return crearNodo('continue') }
    / "return" _ exp:Expresion? _ ";" { return crearNodo('return', { exp }) }

TipoEmb = tem:"parseInt("  { return tem }
      / tem:"parsefloat("  { return tem }
      / tem:"toString("    { return tem }
      / tem:"toLowerCase(" { return tem }
      / tem:"toUpperCase(" { return tem }

Expresion = FuncionArreglo
            / ArrAsign:AsignacionArreglo  { return ArrAsign }
            / ArrAcces:AccesoArreglo { return ArrAcces }
            / Asignacion

FuncionArreglo = id:Identificador "." funcion:("indexOf(" _ argumento:Expresion _ ")" { return { funcion: 'indexOf', argumento }; }
              / "join()" { return { funcion: 'join' }; }
              / "length" { return { funcion: 'length' }; }) { return crearNodo('funcionArreglo', { id, funcion: funcion.funcion, argumento: funcion.argumento }); }

Tercero = cond:OR _ "?" _ iftrue:Expresion _ ":" _ iffalse:Expresion { return crearNodo('ternario', {cond, iftrue, iffalse}); }

Asignacion = tipo:"typeof" _ exp:Expresion _ { return crearNodo('embebidas', { tipo, exp }); }
            / id:Identificador _ "=" _ asgn:Asignacion { return crearNodo('asignacion', {id, asgn} )}            
            / id:Identificador _ "+=" _ asgn:Asignacion { return crearNodo('asignacion', { id, asgn: crearNodo('binaria', { op: '+', izq: crearNodo('referenciaVariable', { id }), der: asgn }) }) }
            / id:Identificador _ "-=" _ asgn:Asignacion { return crearNodo('asignacion', { id, asgn: crearNodo('binaria', { op: '-', izq: crearNodo('referenciaVariable', { id }), der: asgn }) }) }
            / tercer:Tercero { return tercer }
            / OR

AccesoArreglo = id:Identificador _ "[" _ indice:Expresion _ "]" { return crearNodo('accesoArreglo', { id, indice }) }

AsignacionArreglo = id:Identificador _ "[" _ indice:Expresion _ "]" _ "=" _ valor:Expresion _ { return crearNodo('asignacionArreglo', { id, indice, valor }) }

OR = izq:AND expansion:(
  _ op:( "||" ) _ der:AND { return { tipo: op, der } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual
      return crearNodo('binaria', { op:tipo, izq: operacionAnterior, der })
    },
    izq
  )
}

AND = izq:Comparacion expansion:(
  _ op:( "&&" ) _ der:Comparacion { return { tipo: op, der } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual
      return crearNodo('binaria', { op:tipo, izq: operacionAnterior, der })
    },
    izq
  )
}

Comparacion = izq:Relacionales expansion:(
  _ op:("!=" / "==") _ der:Relacionales { return { tipo: op, der } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual
      return crearNodo('binaria', { op:tipo, izq: operacionAnterior, der })
    },
    izq
  )
}

Relacionales = izq:Adicion expansion:(
  _ op:("<=" / "<" / ">=" / ">") _ der:Adicion { return { tipo: op, der } }
)* {
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual
      return crearNodo('binaria', { op:tipo, izq: operacionAnterior, der })
    },
    izq
  )
}

Adicion = izq:Multiplicacion expansion:(
  _ op:("+" / "-") _ der:Multiplicacion { return { tipo: op, der } }
  )* { 
  return expansion.reduce(
    (opPrevia, opActual) => {
      const { tipo, der } = opActual
      return crearNodo('binaria', { op:tipo, izq: opPrevia, der })
    },
    izq
  )
}

Multiplicacion = izq:Unaria expansion:(
  _ op:("*" / "/" / "%") _ der:Unaria { return { tipo: op, der } }
)* {
    return expansion.reduce(
      (opPrevia, opActual) => {
        const { tipo, der } = opActual
        return crearNodo('binaria', { op:tipo, izq: opPrevia, der })
      },
      izq
    )
}

Unaria = "-" _ num:Unaria { return crearNodo('unaria', { op: '-', exp: num }) }
      / "!" _ num:Unaria { return crearNodo('unaria', { op: '!', exp: num }) }
      / Llamada

Llamada = callee:Primitivo _ params:("(" args:Argumentos? ")" { return args })*{
  return params.reduce(
    (callee, args) => {
      return crearNodo('llamada', {callee, args: args || [] } )
    },
    callee
  )
}

Argumentos = arg:Expresion _ args:("," _ exp:Expresion { return exp })* { return [arg, ...args] }

Identificador = [a-zA-Z_][a-zA-Z0-9_]* { return text() }

Primitivo = [0-9]+"."[0-9]+ {return crearNodo('Primal', { valor: parseFloat(text(), 10), tipo: 'float' })}
  / [0-9]+                  {return crearNodo('Primal', { valor: parseInt(text(), 10), tipo: 'int' })}
  / "true"                  {return crearNodo('Primal', { valor: true, tipo: 'boolean' })}
  / "false"                 {return crearNodo('Primal', { valor: false, tipo: 'boolean' })}
  / str:String              { return str }
  / "\'" [^'] "\'"          {return crearNodo('Primal', { valor: text().slice(1, -1), tipo: 'char' })}
  / "(" _ exp:Expresion _ ")" { return crearNodo('agrupacion', { exp }) }
  / tipo:TipoEmb _ exp:Expresion _ ")" { return crearNodo('embebidas', { tipo, exp }); }
  / id:Identificador { return crearNodo('referenciaVariable', { id }) }

String
  = "\"" chars:((EscapedChar / [^"\\])*) "\"" {
      return crearNodo('Primal', { valor: chars.join(''), tipo: 'string' });
    }

EscapedChar
  = "\\" ("n" { return "\n"; }
          / "r" { return "\r"; }
          / "t" { return "\t"; }
          / "\"" { return "\""; }
          / "\\" { return "\\"; })

_ = ([ \t\n\r] / Comentarios)*

Comentarios = "//" (![\n] .)*
            / "/*" (!("*/") .)* "*/"